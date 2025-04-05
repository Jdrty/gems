
import { useState } from 'react';
import CityMap from '@/components/CityMap';
import LocationDetail from '@/components/LocationDetail';
import { Location } from '@/lib/mockData';
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

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full"
      >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-card">
          <div className="p-4 h-full overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
            {loading ? (
              <Skeleton className="h-[400px] rounded-lg" />
            ) : (
              <LocationDetail location={selectedLocation} />
            )}
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={75}>
          <div className="h-full p-4">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <CityMap onLocationSelect={setSelectedLocation} />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Home;
