
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location, getLocations } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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
        const locationsData = await getLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error('Failed to load locations:', error);
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
      const { error } = await supabase
        .from('location_visits')
        .insert({
          user_id: user.id,
          location_id: locationId,
          is_gem: locations.find(loc => loc.id === locationId)?.isHiddenGem || false
        });

      if (error) {
        throw error;
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
