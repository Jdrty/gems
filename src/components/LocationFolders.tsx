import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types/location';
import { Folder, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface LocationFoldersProps {
  onLocationSelect: (location: Location) => void;
}

const LocationFolders = ({ onLocationSelect }: LocationFoldersProps) => {
  const { locations, isLocationVisited } = useApp();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    private: true,
    public: false
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // For now, all locations are considered private gems
  const privateGems = locations;
  const publicGems: Location[] = [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start font-medium"
          onClick={() => toggleFolder('private')}
        >
          {expandedFolders.private ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          <Folder className="h-4 w-4 mr-2 text-green-500" />
          Private Gems
          <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-500 border-green-500/20">
            {privateGems.length}
          </Badge>
        </Button>
        
        {expandedFolders.private && (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-1 pl-6">
              {privateGems.map(location => (
                <Button
                  key={location.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm hover:bg-green-500/30"
                  onClick={() => onLocationSelect(location)}
                >
                  <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span className="truncate">{location.name}</span>
                  {isLocationVisited(location.id) && (
                    <Check className="h-3.5 w-3.5 ml-auto text-yellow-500" />
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start font-medium"
          onClick={() => toggleFolder('public')}
        >
          {expandedFolders.public ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          Public Gems
          <Badge variant="outline" className="ml-auto bg-blue-500/10 text-blue-500 border-blue-500/20">
            {publicGems.length}
          </Badge>
        </Button>
        
        {expandedFolders.public && (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-1 pl-6">
              {publicGems.map(location => (
                <Button
                  key={location.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => onLocationSelect(location)}
                >
                  <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span className="truncate">{location.name}</span>
                  {isLocationVisited(location.id) && (
                    <Check className="h-3.5 w-3.5 ml-auto text-yellow-500" />
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default LocationFolders; 