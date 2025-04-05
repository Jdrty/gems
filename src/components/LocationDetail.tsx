import { useState } from 'react';
import { Location } from '@/types/location';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, MapPin, UserX, Star, MapPinned, Clock, Tag, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LocationFolders from './LocationFolders';

interface LocationDetailProps {
  location: Location | null;
  onLocationSelect?: (location: Location) => void;
}

const LocationDetail = ({ location, onLocationSelect }: LocationDetailProps) => {
  const { markLocationVisited, isLocationVisited, isGuestMode } = useApp();
  const { user } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);

  if (!location) {
    return (
      <div className="p-6 border rounded-lg bg-secondary/30 h-full flex flex-col">
        <div className="mb-6 text-center">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Select a Location</h3>
          <p className="text-center text-muted-foreground">
            Select a location on the map or from the folders below
          </p>
        </div>
        
        {onLocationSelect && (
          <LocationFolders 
            onLocationSelect={onLocationSelect} 
            onBack={() => onLocationSelect(null)} 
          />
        )}
      </div>
    );
  }

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await markLocationVisited(location.id);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const visited = isLocationVisited(location.id);

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => onLocationSelect?.(null)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">{location.name}</CardTitle>
              {location.is_hidden_gem && !visited && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Star className="w-3 h-3 mr-1" />
                  Hidden Gem
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPinned className="w-3.5 h-3.5" />
              {location.area || 'Location'}
            </CardDescription>
          </div>
          {visited && (
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/30">
              <Check className="w-3.5 h-3.5 mr-1" />
              Visited
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        <div className="space-y-4">
          <div className="bg-card/50 p-4 rounded-lg border">
            <p className="text-sm leading-relaxed">{location.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/50 p-3 rounded-lg border flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Best Time</p>
                <p className="text-sm font-medium">Anytime</p>
              </div>
            </div>
            <div className="bg-card/50 p-3 rounded-lg border flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{location.category_id || 'Uncategorized'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Coordinates</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-muted-foreground" />
                <span>Lat: {location.latitude.toFixed(6)}°</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-muted-foreground" />
                <span>Long: {location.longitude.toFixed(6)}°</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full space-y-3">
          {isGuestMode && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-md mb-2 flex gap-2 items-center">
              <UserX className="text-amber-500 w-4 h-4 flex-shrink-0" />
              <p className="text-xs text-amber-500">
                You're in guest mode. Visits won't be saved after you leave.
              </p>
            </div>
          )}
          
          <Button 
            className="w-full"
            disabled={visited || checkingIn}
            onClick={handleCheckIn}
            variant={visited ? "outline" : "default"}
          >
            {checkingIn 
              ? "Checking in..." 
              : visited 
                ? "Already Visited" 
                : "Check In Here"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LocationDetail;
