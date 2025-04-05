import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CityMap, { MapRef } from '@/components/CityMap';
import LocationDetail from '@/components/LocationDetail';
import AddLocationButton from '@/components/AddLocationButton';
import { Location } from '@/types/location';
import { useApp } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Home = () => {
  const { loading } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<MapRef>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle location selection from Explore page
  useEffect(() => {
    if (location.state?.selectedLocation) {
      const loc = location.state.selectedLocation;
      console.log('Selected location from Explore:', loc);
      
      // Ensure the location has the correct format
      const formattedLocation = {
        ...loc,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        difficulty_to_find: loc.difficulty_to_find || 0,
        is_hidden_gem: loc.is_hidden_gem || false,
        is_private: loc.is_private || false,
        is_user_uploaded: loc.is_user_uploaded || false
      };
      
      setSelectedLocation(formattedLocation);
      
      // Use setTimeout to ensure the map is fully initialized
      setTimeout(() => {
        if (mapRef.current) {
          console.log('Centering map on coordinates:', [formattedLocation.longitude, formattedLocation.latitude]);
          mapRef.current.centerOnCoordinates([formattedLocation.longitude, formattedLocation.latitude]);
        } else {
          console.log('Map ref is not available');
        }
      }, 500);
    }
  }, [location.state]);

  const handleLocationAdded = (coordinates: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.centerOnCoordinates(coordinates);
    }
  };

  const handleLocationSelect = (location: Location | null) => {
    setSelectedLocation(location);
    if (location && mapRef.current) {
      mapRef.current.centerOnCoordinates([location.longitude, location.latitude]);
    }
  };

  const handleBackToExplore = () => {
    navigate('/explore');
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 md:p-6">
      {location.state?.selectedLocation && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToExplore}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Explore
          </Button>
        </div>
      )}
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full gap-4"
      >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-card rounded-lg">
          <div className="p-4 h-full overflow-auto space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Location Details</h2>
              <AddLocationButton onLocationAdded={handleLocationAdded} />
            </div>
            {loading ? (
              <Skeleton className="h-[400px] rounded-lg" />
            ) : (
              <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
                <div className="h-full p-4">
                  <LocationDetail 
                    location={selectedLocation} 
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </ResizablePanel>
            )}
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-border" />
        
        <ResizablePanel defaultSize={75}>
          <div className="h-full rounded-lg overflow-hidden">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <CityMap ref={mapRef} onLocationSelect={handleLocationSelect} />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Home;
