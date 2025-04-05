
// Mock data for city locations and hidden gems
export type LocationType = 'restaurant' | 'park' | 'museum' | 'cafe' | 'landmark' | 'shop';

export interface Location {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  coordinates: [number, number]; // [longitude, latitude]
  isHiddenGem: boolean;
  image?: string;
}

export interface UserProgress {
  visitedLocations: string[]; // Location IDs
  discoveredGems: string[]; // Hidden gem location IDs
}

// Mock locations for San Francisco
const sfLocations: Location[] = [
  {
    id: "1",
    name: "Golden Gate Park",
    description: "Sprawling urban park with gardens, museums, and trails",
    type: "park",
    coordinates: [-122.4836, 37.7694],
    isHiddenGem: false,
  },
  {
    id: "2",
    name: "Fisherman's Wharf",
    description: "Popular waterfront area with shops and restaurants",
    type: "landmark",
    coordinates: [-122.4169, 37.8080],
    isHiddenGem: false,
  },
  {
    id: "3",
    name: "City Lights Bookstore",
    description: "Historic independent bookstore and publisher",
    type: "shop",
    coordinates: [-122.4067, 37.7973],
    isHiddenGem: true,
  },
  {
    id: "4",
    name: "Balmy Alley Murals",
    description: "Vibrant street art in the Mission District",
    type: "landmark",
    coordinates: [-122.4121, 37.7517],
    isHiddenGem: true,
  },
  {
    id: "5",
    name: "Sutro Baths Ruins",
    description: "Historic bath house ruins with ocean views",
    type: "landmark",
    coordinates: [-122.5151, 37.7810],
    isHiddenGem: true,
  },
  {
    id: "6",
    name: "Ferry Building Marketplace",
    description: "Food hall and farmers market in historic ferry terminal",
    type: "shop",
    coordinates: [-122.3933, 37.7956],
    isHiddenGem: false,
  },
  {
    id: "7",
    name: "The Wave Organ",
    description: "Wave-activated acoustic sculpture on the bay",
    type: "landmark",
    coordinates: [-122.4401, 37.8086],
    isHiddenGem: true,
  },
  {
    id: "8",
    name: "Twin Peaks",
    description: "Famous hills offering panoramic views of the city",
    type: "landmark",
    coordinates: [-122.4477, 37.7544],
    isHiddenGem: false,
  }
];

// Initial user progress
const initialUserProgress: UserProgress = {
  visitedLocations: [],
  discoveredGems: []
};

// Mock API functions
export const getLocations = (): Promise<Location[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sfLocations);
    }, 500); // Simulated API delay
  });
};

export const getUserProgress = (): Promise<UserProgress> => {
  // In a real app, we'd get this from a database
  const savedProgress = localStorage.getItem('userProgress');
  return new Promise((resolve) => {
    setTimeout(() => {
      if (savedProgress) {
        resolve(JSON.parse(savedProgress));
      } else {
        localStorage.setItem('userProgress', JSON.stringify(initialUserProgress));
        resolve(initialUserProgress);
      }
    }, 300);
  });
};

export const saveUserProgress = (progress: UserProgress): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem('userProgress', JSON.stringify(progress));
      resolve();
    }, 300);
  });
};

// Stats calculation helpers
export const calculateStats = (progress: UserProgress, locations: Location[]) => {
  const totalLocations = locations.length;
  const totalVisited = progress.visitedLocations.length;
  const totalHiddenGems = locations.filter(loc => loc.isHiddenGem).length;
  const discoveredGems = progress.discoveredGems.length;
  
  return {
    totalLocations,
    totalVisited,
    completionPercentage: Math.round((totalVisited / totalLocations) * 100),
    totalHiddenGems,
    discoveredGems,
    gemCompletionPercentage: Math.round((discoveredGems / totalHiddenGems) * 100)
  };
};
