import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Location {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  city_id: string;
  category_id: string | null;
  is_hidden_gem: boolean;
  difficulty_to_find: number | null;
  image_url: string | null;
  area: string | null;
  is_private: boolean;
  is_user_uploaded: boolean;
}

interface AppContextType {
  locations: Location[];
  loading: boolean;
  markLocationVisited: (locationId: string) => Promise<void>;
  isLocationVisited: (locationId: string) => boolean;
  visitedLocations: string[];
  isGuestMode: boolean;
  setGuestMode: (value: boolean) => void;
  addLocation: (location: Omit<Location, 'id' | 'city_id'>) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setGuestMode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch this from your API
        // For now, we'll use mock data
        const mockLocations: Location[] = [
          {
            id: '1',
            city_id: '1',
            name: 'CN Tower',
            description: 'The iconic CN Tower offers breathtaking views of Toronto.',
            address: '290 Bremner Blvd, Toronto, ON M5V 3L9',
            latitude: 43.6426,
            longitude: -79.3871,
            category_id: '1',
            is_hidden_gem: true,
            difficulty_to_find: 1,
            image_url: 'https://example.com/cn-tower.jpg',
            area: 'Downtown Toronto',
            is_private: false,
            is_user_uploaded: false
          },
          {
            id: '2',
            city_id: '1',
            name: 'Kensington Market',
            description: 'A vibrant neighborhood known for its diverse food and culture.',
            address: 'Kensington Ave, Toronto, ON M5T 2K2',
            latitude: 43.6544,
            longitude: -79.4012,
            category_id: '2',
            is_hidden_gem: true,
            difficulty_to_find: 2,
            image_url: 'https://example.com/kensington.jpg',
            area: 'Kensington Market',
            is_private: false,
            is_user_uploaded: false
          },
          {
            id: '3',
            city_id: '1',
            name: 'Graffiti Alley',
            description: 'A colorful alley filled with street art and murals.',
            address: 'Rush Lane, Toronto, ON M5T 2T2',
            latitude: 43.6532,
            longitude: -79.3947,
            category_id: '3',
            is_hidden_gem: true,
            difficulty_to_find: 3,
            image_url: 'https://example.com/graffiti.jpg',
            area: 'Queen Street West',
            is_private: false,
            is_user_uploaded: false
          }
        ];
        
        setLocations(mockLocations);
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

  const addLocation = async (location: Omit<Location, 'id' | 'city_id'>) => {
    try {
      // Generate a temporary ID (in a real app, this would come from the backend)
      const tempId = `temp-${Date.now()}`;
      
      // Set a default city ID (in a real app, this would be based on the user's current city)
      const defaultCityId = '1';
      
      // Create the new location with the temporary ID and default city ID
      const newLocation: Location = {
        ...location,
        id: tempId,
        city_id: defaultCityId,
        address: location.address || null,
        category_id: location.category_id || null,
        difficulty_to_find: location.difficulty_to_find || 1,
        image_url: location.image_url || null,
        area: location.area || null,
        is_private: location.is_private !== undefined ? location.is_private : true,
        is_user_uploaded: true  // Set to true for user-added locations
      };
      
      // Update the locations state with the new location
      setLocations(prevLocations => [...prevLocations, newLocation]);
      
      toast.success('Location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
      throw error;
    }
  };

  const deleteLocation = async (locationId: string) => {
    try {
      // Find the location to be deleted
      const locationToDelete = locations.find(loc => loc.id === locationId);
      
      if (!locationToDelete) {
        throw new Error('Location not found');
      }
      
      // Only allow deletion of user-uploaded locations
      if (!locationToDelete.is_user_uploaded) {
        toast.error('You can only delete locations that you have added');
        return;
      }
      
      // Remove the location from the state
      setLocations(prevLocations => 
        prevLocations.filter(location => location.id !== locationId)
      );
      
      // If the location was visited, remove it from visited locations
      if (visitedLocations.includes(locationId)) {
        setVisitedLocations(prev => 
          prev.filter(id => id !== locationId)
        );
      }
      
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      locations,
      loading,
      markLocationVisited,
      isLocationVisited,
      visitedLocations,
      isGuestMode,
      setGuestMode,
      addLocation,
      deleteLocation
    }}>
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
