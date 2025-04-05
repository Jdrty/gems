import { useState, useRef } from 'react';
import CityMap, { MapRef } from '@/components/CityMap';
import LocationDetail from '@/components/LocationDetail';
import AddLocationButton from '@/components/AddLocationButton';
import { Location } from '@/types/location';
import { useApp } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Home = () => {
  const { loading } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<MapRef>(null);

  const handleLocationAdded = (coordinates: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.centerOnCoordinates(coordinates);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 md:p-6">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full gap-4"
      >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-card rounded-lg">
          <div className="p-4 h-full overflow-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Location Details</h2>
              <AddLocationButton onLocationAdded={handleLocationAdded} />
            </div>
            {loading ? (
              <Skeleton className="h-[400px] rounded-lg" />
            ) : (
              <LocationDetail location={selectedLocation} />
            )}
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-border" />
        
        <ResizablePanel defaultSize={75}>
          <div className="h-full rounded-lg overflow-hidden">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <CityMap ref={mapRef} onLocationSelect={setSelectedLocation} />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Home;
