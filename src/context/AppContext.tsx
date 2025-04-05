import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Location, AppLocation } from '@/types/location';

const CATEGORIES = [
  { id: '1', name: 'Parks' },
  { id: '2', name: 'Cafe' },
  { id: '3', name: 'Museums' },
  { id: '4', name: 'Landmarks' },
  { id: '5', name: 'Shopping' },
  { id: '6', name: 'Nature' },
  { id: '7', name: 'Viewpoint' },
  { id: '8', name: 'Other' }
] as const;

interface AppContextType {
  locations: AppLocation[];
  loading: boolean;
  markLocationVisited: (locationId: string) => Promise<void>;
  isLocationVisited: (locationId: string) => boolean;
  visitedLocations: string[];
  isGuestMode: boolean;
  setGuestMode: (value: boolean) => void;
  addLocation: (location: Omit<Location, 'id' | 'city_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isAddLocationOpen: boolean;
  setAddLocationOpen: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<AppLocation[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setGuestMode] = useState(false);
  const [isAddLocationOpen, setAddLocationOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        
        // Fetch locations from Supabase
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Convert Location to AppLocation
        const appLocations: AppLocation[] = (data as Location[]).map(location => ({
          ...location,
          is_private: false, // Default to false for existing locations
          is_user_uploaded: false // Default to false for existing locations
        }));

        setLocations(appLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
        toast.error('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    // Reset visited locations when switching to guest mode
    if (isGuestMode) {
      setVisitedLocations([]);
      return;
    }

    // Only load from database when user is logged in and not in guest mode
    if (!user || isGuestMode) {
      setVisitedLocations([]);
      return;
    }

    const loadVisitedLocations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('location_visits')
          .select('location_id')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        const locationIds = data.map(item => item.location_id);
        setVisitedLocations(locationIds);
      } catch (error) {
        console.error('Failed to load visited locations:', error);
        toast.error('Failed to load your visited locations');
      } finally {
        setLoading(false);
      }
    };

    loadVisitedLocations();
  }, [user, isGuestMode]);

  const markLocationVisited = async (locationId: string) => {
    // For guest mode, just update the local state without persisting
    if (isGuestMode || !user) {
      if (isGuestMode) {
        setVisitedLocations(prev => {
          if (prev.includes(locationId)) return prev;
          return [...prev, locationId];
        });
        toast.success('Location marked as visited (guest mode)');
      } else {
        toast.error('You must be logged in to check in');
      }
      return;
    }
    
    if (visitedLocations.includes(locationId)) return;
    
    try {
      const location = locations.find(loc => loc.id === locationId);
      if (!location) throw new Error('Location not found');

      // For user-uploaded locations, just update the local state
      if (location.is_user_uploaded) {
        setVisitedLocations(prev => [...prev, locationId]);
        toast.success('Checked in successfully! ✅');
        return;
      }

      // For non-user-uploaded locations, save to the database
      const { error: visitError } = await supabase
        .from('location_visits')
        .insert({
          user_id: user.id,
          location_id: locationId,
          is_gem: location.is_hidden_gem
        });

      if (visitError) throw visitError;

      // Update category stats
      if (location.category_id) {
        const { data: existingStats, error: statsError } = await supabase
          .from('category_stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('category_id', location.category_id)
          .single();

        if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "not found" error
          throw statsError;
        }

        if (existingStats) {
          // Update existing stats
          const { error: updateError } = await supabase
            .from('category_stats')
            .update({
              visit_count: existingStats.visit_count + 1,
              last_visit_at: new Date().toISOString()
            })
            .eq('id', existingStats.id);

          if (updateError) throw updateError;
        } else {
          // Create new stats
          const { error: insertError } = await supabase
            .from('category_stats')
            .insert({
              user_id: user.id,
              category_id: location.category_id,
              visit_count: 1,
              last_visit_at: new Date().toISOString()
            });

          if (insertError) throw insertError;
        }
      }

      // Update visit history
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const { data: existingHistory, error: historyError } = await supabase
        .from('visit_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (historyError && historyError.code !== 'PGRST116') {
        throw historyError;
      }

      if (existingHistory) {
        // Update existing history
        const { error: updateError } = await supabase
          .from('visit_history')
          .update({
            visit_count: existingHistory.visit_count + 1
          })
          .eq('id', existingHistory.id);

        if (updateError) throw updateError;
      } else {
        // Create new history
        const { error: insertError } = await supabase
          .from('visit_history')
          .insert({
            user_id: user.id,
            year,
            month,
            visit_count: 1
          });

        if (insertError) throw insertError;
      }

      setVisitedLocations(prev => [...prev, locationId]);
      toast.success('Checked in successfully! ✅');
    } catch (error) {
      console.error('Failed to mark location as visited:', error);
      toast.error('Failed to check in. Please try again.');
    }
  };

  const isLocationVisited = (locationId: string) => {
    return visitedLocations.includes(locationId);
  };

  const addLocation = async (location: Omit<Location, 'id' | 'city_id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to add a location');
      }

      // Prepare the location data - only include fields that exist in the Supabase schema
      const locationData = {
        name: location.name,
        description: location.description,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        city_id: '1', // Default city ID for now
        category_id: location.category_id,
        is_hidden_gem: true,
        difficulty_to_find: location.difficulty_to_find,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the new location into Supabase
      const { data: newLocation, error } = await supabase
        .from('locations')
        .insert(locationData)
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      if (!newLocation) {
        throw new Error('Failed to create location');
      }

      // Convert the new location to AppLocation and update the local state
      const newAppLocation: AppLocation = {
        ...newLocation as Location,
        is_private: true, // New locations are private by default
        is_user_uploaded: true // New locations are always user uploaded
      };

      setLocations(prevLocations => [...prevLocations, newAppLocation]);
      
      toast.success('Location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add location';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        locations,
        loading,
        markLocationVisited,
        isLocationVisited,
        visitedLocations,
        isGuestMode,
        setGuestMode,
        addLocation,
        isAddLocationOpen,
        setAddLocationOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
