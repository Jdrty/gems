import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types/location';
import { MapPin, Star, Clock, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type SortOption = 'recent' | 'difficulty' | 'name';

const Explore = () => {
  const { locations, loading } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const navigate = useNavigate();

  const handleViewGem = (location: Location) => {
    navigate('/', { state: { selectedLocation: location } });
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

  const sortedLocations = sortLocations(locations);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLocations.map((location) => (
            <Card key={location.id} className="overflow-hidden">
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
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {location.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewGem(location)}
                >
                  View Gem
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore; 