import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Location, AppLocation } from '@/types/location';

const FALLBACK_LOCATIONS: AppLocation[] = [
  {
    id: 'demo-cn-tower',
    name: 'CN Tower Lookout',
    description: 'Toronto’s landmark tower with sweeping views of the skyline and Lake Ontario.',
    address: '290 Bremner Blvd, Toronto, ON',
    latitude: 43.6426,
    longitude: -79.3871,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: false,
    difficulty_to_find: null,
    image_url: null,
    area: 'Downtown Toronto',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: false,
  },
  {
    id: 'demo-hearn',
    name: 'Hearn Generating Station',
    description: 'Decommissioned power plant famed among urban explorers for its colossal turbine hall.',
    address: '440 Unwin Ave, Toronto, ON',
    latitude: 43.6405,
    longitude: -79.3443,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: true,
    difficulty_to_find: 4,
    image_url: null,
    area: 'Port Lands',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: false,
  },
  {
    id: 'demo-lower-bay',
    name: 'Lower Bay Station',
    description: 'Abandoned TTC station used for movie productions and secret service runs.',
    address: '844 Bloor St W, Toronto, ON',
    latitude: 43.6677,
    longitude: -79.3931,
    city_id: 'demo-toronto',
    category_id: '3',
    is_hidden_gem: true,
    difficulty_to_find: 5,
    image_url: null,
    area: 'The Annex',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: false,
  },
  {
    id: 'demo-guild-park',
    name: 'Guild Park Silo Ruins',
    description: 'Historic architectural fragments hidden inside a lakeside ravine park.',
    address: '201 Guildwood Pkwy, Scarborough, ON',
    latitude: 43.7412,
    longitude: -79.1754,
    city_id: 'demo-toronto',
    category_id: '6',
    is_hidden_gem: true,
    difficulty_to_find: 3,
    image_url: null,
    area: 'Guildwood',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-leslie-spit',
    name: 'Leslie Street Spit Lookout',
    description: 'Wind-swept peninsula with shipwreck relics and skyline views.',
    address: 'Tommy Thompson Park, Toronto, ON',
    latitude: 43.6255,
    longitude: -79.3298,
    city_id: 'demo-toronto',
    category_id: '6',
    is_hidden_gem: true,
    difficulty_to_find: 2,
    image_url: null,
    area: 'Leslieville',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-mcgarvey',
    name: 'McGarvey Shoal Lighthouse Ruins',
    description: 'Partial lighthouse foundation standing offshore, popular with kayakers and photographers.',
    address: 'Toronto Islands, ON',
    latitude: 43.625,
    longitude: -79.3475,
    city_id: 'demo-toronto',
    category_id: '7',
    is_hidden_gem: true,
    difficulty_to_find: 4,
    image_url: null,
    area: 'Outer Harbour',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-cabbagetown-rowhouse',
    name: 'Cabbagetown Coach House Shell',
    description: 'Demo location: a boarded Victorian rowhouse used to showcase abandoned home entries.',
    address: 'Winchester St & Sumach St, Toronto, ON',
    latitude: 43.6675,
    longitude: -79.3662,
    city_id: 'demo-toronto',
    category_id: '8',
    is_hidden_gem: true,
    difficulty_to_find: 3,
    image_url: null,
    area: 'Cabbagetown',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: false,
  },
  {
    id: 'demo-parkdale-manor',
    name: 'Parkdale Manor Ruins',
    description: 'Demo location: crumbling brick manor representing a classic abandoned house exploration.',
    address: 'Jameson Ave & Leopold St, Toronto, ON',
    latitude: 43.6373,
    longitude: -79.4351,
    city_id: 'demo-toronto',
    category_id: '8',
    is_hidden_gem: true,
    difficulty_to_find: 4,
    image_url: null,
    area: 'Parkdale',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: false,
  },
  {
    id: 'demo-scarborough-farmhouse',
    name: 'Scarborough Farmstead',
    description: 'Demo location: weathered farmhouse along the bluffs for testing abandoned home workflows.',
    address: 'Kingston Rd & Brimley Rd, Scarborough, ON',
    latitude: 43.7074,
    longitude: -79.2378,
    city_id: 'demo-toronto',
    category_id: '8',
    is_hidden_gem: true,
    difficulty_to_find: 2,
    image_url: null,
    area: 'Cliffside',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: false,
  },
  {
    id: 'demo-yonge-condo-build',
    name: 'Yonge Street Tower Build',
    description: 'Demo construction zone: a new apartment tower rising just north of College Street.',
    address: '487 Yonge St, Toronto, ON',
    latitude: 43.6629,
    longitude: -79.3838,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: false,
    difficulty_to_find: 1,
    image_url: null,
    area: 'Downtown Core',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-east-bayfront-site',
    name: 'East Bayfront Waterfront Residences',
    description: 'Demo construction zone: active condo build showcasing community growth along the lake.',
    address: 'Queens Quay E & Bonnycastle St, Toronto, ON',
    latitude: 43.6417,
    longitude: -79.3684,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: false,
    difficulty_to_find: 1,
    image_url: null,
    area: 'East Bayfront',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-dundas-west-hub',
    name: 'Dundas West Transit Hub Lofts',
    description: 'Demo construction zone: mid-rise apartments overlooking the evolving Bloor & Dundas junction.',
    address: '1540 Bloor St W, Toronto, ON',
    latitude: 43.6564,
    longitude: -79.4548,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: false,
    difficulty_to_find: 1,
    image_url: null,
    area: 'The Junction',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-eglinton-crosstown',
    name: 'Eglinton Crosstown Residences',
    description: 'Demo construction zone: apartments integrated with the future Crosstown LRT station.',
    address: '2600 Eglinton Ave W, York, ON',
    latitude: 43.6898,
    longitude: -79.4652,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: false,
    difficulty_to_find: 1,
    image_url: null,
    area: 'York',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
  {
    id: 'demo-scarborough-centre-towers',
    name: 'Scarborough Centre Twin Towers',
    description: 'Demo construction zone: paired apartment towers beside the civic centre.',
    address: '150 Borough Dr, Scarborough, ON',
    latitude: 43.7755,
    longitude: -79.2581,
    city_id: 'demo-toronto',
    category_id: '4',
    is_hidden_gem: false,
    difficulty_to_find: 1,
    image_url: null,
    area: 'Scarborough City Centre',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
    is_user_uploaded: true,
  },
];

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
  deleteLocation: (locationId: string) => Promise<void>;
  favoriteLocations: string[];
  toggleFavorite: (locationId: string) => void;
  isLocationFavorited: (locationId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<AppLocation[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<string[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setGuestMode] = useState(true);
  const [isAddLocationOpen, setAddLocationOpen] = useState(false);
  const { user } = useAuth();

  // Automatically disable guest mode when a real user session exists
  useEffect(() => {
    if (user && isGuestMode) {
      setGuestMode(false);
    }
  }, [user, isGuestMode]);

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

        // Convert Location to AppLocation and filter out test locations
        const appLocations: AppLocation[] = (data as Location[])
          .filter(location => !location.name.toLowerCase().includes('test'))
          .map(location => ({
            ...location,
            is_private: false, // Default to false for existing locations
            is_user_uploaded: false // Default to false for existing locations
          }));

        if (appLocations.length === 0) {
          console.info('No locations returned from Supabase — using fallback seed data.');
          setLocations(FALLBACK_LOCATIONS);
        } else {
          setLocations(appLocations);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
        setLocations(FALLBACK_LOCATIONS);
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
      setFavoriteLocations([]);
      return;
    }

    // Only load from database when user is logged in and not in guest mode
    if (!user || isGuestMode) {
      setVisitedLocations([]);
      setFavoriteLocations([]);
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

  // Load favorites from localStorage on initial load
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const storedFavorites = localStorage.getItem('favoriteLocations');
        if (storedFavorites) {
          setFavoriteLocations(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
      }
    };
    
    loadFavorites();
  }, []);
  
  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favoriteLocations]);

  const markLocationVisited = async (locationId: string) => {
    // For guest mode, just update the local state without persisting
    if (isGuestMode || !user) {
      if (isGuestMode) {
        setVisitedLocations(prev => {
          if (prev.includes(locationId)) {
            return prev.filter(id => id !== locationId);
          }
          return [...prev, locationId];
        });
        toast.success(visitedLocations.includes(locationId) ? 'Location unmarked as visited' : 'Location marked as visited (guest mode)');
      } else {
        toast.error('You must be logged in to check in');
      }
      return;
    }
    
    try {
      const location = locations.find(loc => loc.id === locationId);
      if (!location) throw new Error('Location not found');

      // For user-uploaded locations, just update the local state
      if (location.is_user_uploaded) {
        setVisitedLocations(prev => {
          if (prev.includes(locationId)) {
            return prev.filter(id => id !== locationId);
          }
          return [...prev, locationId];
        });
        toast.success(visitedLocations.includes(locationId) ? 'Location unmarked as visited' : 'Checked in successfully! ✅');
        return;
      }

      // Check if location is already visited
      if (visitedLocations.includes(locationId)) {
        // Unmark as visited
        const { error: deleteError } = await supabase
          .from('location_visits')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', locationId);

        if (deleteError) throw deleteError;

        // Update category stats
        if (location.category_id) {
          const { data: existingStats, error: statsError } = await supabase
            .from('category_stats')
            .select('*')
            .eq('user_id', user.id)
            .eq('category_id', location.category_id)
            .single();

          if (statsError && statsError.code !== 'PGRST116') {
            throw statsError;
          }

          if (existingStats) {
            const newCount = Math.max(0, existingStats.visit_count - 1);
            if (newCount === 0) {
              // Delete the stats record if count reaches 0
              const { error: deleteStatsError } = await supabase
                .from('category_stats')
                .delete()
                .eq('id', existingStats.id);

              if (deleteStatsError) throw deleteStatsError;
            } else {
              // Update existing stats
              const { error: updateError } = await supabase
                .from('category_stats')
                .update({
                  visit_count: newCount,
                  last_visit_at: new Date().toISOString()
                })
                .eq('id', existingStats.id);

              if (updateError) throw updateError;
            }
          }
        }

        setVisitedLocations(prev => prev.filter(id => id !== locationId));
        toast.success('Location unmarked as visited');
      } else {
        // Mark as visited (existing code)
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

          if (statsError && statsError.code !== 'PGRST116') {
            throw statsError;
          }

          if (existingStats) {
            const { error: updateError } = await supabase
              .from('category_stats')
              .update({
                visit_count: existingStats.visit_count + 1,
                last_visit_at: new Date().toISOString()
              })
              .eq('id', existingStats.id);

            if (updateError) throw updateError;
          } else {
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

        setVisitedLocations(prev => [...prev, locationId]);
        toast.success('Checked in successfully! ✅');
      }
    } catch (error) {
      console.error('Failed to toggle location visit status:', error);
      toast.error('Failed to update visit status. Please try again.');
    }
  };

  const isLocationVisited = (locationId: string) => {
    return visitedLocations.includes(locationId);
  };

  const isLocationFavorited = (locationId: string) => {
    return favoriteLocations.includes(locationId);
  };

  const toggleFavorite = (locationId: string) => {
    setFavoriteLocations(prev => {
      const newFavorites = prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId];
      
      // Show toast notification
      toast.success(
        prev.includes(locationId) 
          ? 'Removed from favorites' 
          : 'Added to favorites'
      );
      
      return newFavorites;
    });
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

      // Delete from database
      const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (deleteError) {
        throw deleteError;
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

      // If the location was favorited, remove it from favorites
      if (favoriteLocations.includes(locationId)) {
        setFavoriteLocations(prev =>
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
      isAddLocationOpen,
      setAddLocationOpen,
      deleteLocation,
      favoriteLocations,
      toggleFavorite,
      isLocationFavorited
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
