import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types/location';
import { MapPin, Star, Clock, ArrowUpDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Define categories for location types
const CATEGORIES = [
  { id: '1', name: 'Restaurant' },
  { id: '2', name: 'Cafe' },
  { id: '3', name: 'Bar' },
  { id: '4', name: 'Park' },
  { id: '5', name: 'Museum' },
  { id: '6', name: 'Gallery' },
  { id: '7', name: 'Shopping' },
  { id: '8', name: 'Entertainment' },
  { id: '9', name: 'Landmark' },
  { id: '10', name: 'Nature' },
  { id: '11', name: 'Viewpoint' },
  { id: '12', name: 'Other' }
];

type SortOption = 'recent' | 'difficulty' | 'name';

const Explore = () => {
  const { locations, loading } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleViewGem = (location: Location) => {
    navigate('/', { 
      state: { 
        selectedLocation: {
          ...location,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude)
        } 
      } 
    });
  };

  const sortLocations = (locs: Location[]) => {
    return [...locs].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Sort by ID if it's a string, otherwise compare as is
          if (typeof a.id === 'string' && typeof b.id === 'string') {
            return b.id.localeCompare(a.id);
          }
          // Fallback to simple comparison
          return String(b.id).localeCompare(String(a.id));
        case 'difficulty':
          return (b.difficulty_to_find || 0) - (a.difficulty_to_find || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const toggleDifficulty = (difficulty: number) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty) 
        : [...prev, difficulty]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedCategories([]);
  };

  const filteredLocations = locations.filter(location => {
    // Filter by difficulty if any are selected
    if (selectedDifficulties.length > 0) {
      if (!location.difficulty_to_find || !selectedDifficulties.includes(location.difficulty_to_find)) {
        return false;
      }
    }
    
    // Filter by category if any are selected
    if (selectedCategories.length > 0) {
      if (!location.category_id || !selectedCategories.includes(location.category_id)) {
        return false;
      }
    }
    
    return true;
  });

  const sortedLocations = sortLocations(filteredLocations);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-8">
          <Skeleton className="h-[60px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Explore Gems</h1>
            <p className="text-muted-foreground">
              Discover hidden gems shared by the community
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(selectedDifficulties.length > 0 || selectedCategories.length > 0) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {(selectedDifficulties.length > 0 || selectedCategories.length > 0) && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedDifficulties.length + selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </div>
            
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Most Recent
                  </div>
                </SelectItem>
                <SelectItem value="difficulty">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Highest Difficulty
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Name
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="sm:max-w-[500px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Gems
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <h3 className="font-medium">Difficulty</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulties.includes(difficulty) ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                      onClick={() => toggleDifficulty(difficulty)}
                    >
                      <Star className="h-3.5 w-3.5 mr-1" />
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium">Category</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLocations.length > 0 ? (
            sortedLocations.map((location) => (
              <Card key={location.id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{location.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {location.area || 'Unknown Area'}
                      </div>
                    </div>
                    {location.difficulty_to_find && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {location.difficulty_to_find}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {location.description}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleViewGem(location)}
                  >
                    View Gem
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No gems match your filters. Try adjusting your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore; 