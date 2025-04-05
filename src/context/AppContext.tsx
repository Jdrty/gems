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
}

interface AppContextType {
  locations: Location[];
  loading: boolean;
  markLocationVisited: (locationId: string) => Promise<void>;
  isLocationVisited: (locationId: string) => boolean;
  visitedLocations: string[];
  isGuestMode: boolean;
  setGuestMode: (value: boolean) => void;
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
        const { data, error } = await supabase
          .from('locations')
          .select('*');

        if (error) {
          throw error;
        }

        setLocations(data);
      } catch (error) {
        console.error('Failed to load locations:', error);
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

  return (
    <AppContext.Provider value={{
      locations,
      loading,
      markLocationVisited,
      isLocationVisited,
      visitedLocations,
      isGuestMode,
      setGuestMode
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
