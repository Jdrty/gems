
import { useState } from 'react';
import { Location } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, MapPin, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface LocationDetailProps {
  location: Location | null;
}

const LocationDetail = ({ location }: LocationDetailProps) => {
  const { markLocationVisited, isLocationVisited, isGuestMode } = useApp();
  const { user } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);

  if (!location) {
    return (
      <div className="p-6 border rounded-lg bg-secondary/30 h-full flex flex-col items-center justify-center">
        <MapPin className="w-10 h-10 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Select a Location</h3>
        <p className="text-center text-muted-foreground">
          Select a location on the map to see details and check in
        </p>
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
    <div className="p-6 border rounded-lg h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{location.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{location.type}</p>
        </div>
        {visited && (
          <div className="bg-green-500/20 text-green-600 text-sm font-medium py-1 px-3 rounded-full flex items-center gap-1">
            <Check className="w-4 h-4" />
            Visited
          </div>
        )}
      </div>
      
      <p className="mb-6 flex-grow">{location.description}</p>
      
      <div className="space-y-3 mt-auto">
        {isGuestMode && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-md mb-2 flex gap-2 items-center">
            <UserX className="text-amber-500 w-4 h-4 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              You're in guest mode. Visits won't be saved after you leave.
            </p>
          </div>
        )}
        
        <Button 
          className="w-full"
          disabled={visited || checkingIn}
          onClick={handleCheckIn}
        >
          {checkingIn 
            ? "Checking in..." 
            : visited 
              ? "Already Visited" 
              : "Check In Here"}
        </Button>
      </div>
    </div>
  );
};

export default LocationDetail;
