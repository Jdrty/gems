import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppLocation } from "@/types/location";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  MapPin,
  FolderPlus,
  Folder,
  Plus,
  Globe,
  ArrowRight,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomFolder {
  id: string;
  name: string;
  locations: string[]; // Array of location IDs
}

interface LocationFoldersProps {
  onLocationSelect: (location: AppLocation) => void;
}

const LocationFolders = ({ onLocationSelect }: LocationFoldersProps) => {
  const { locations, isLocationVisited, isLocationFavorited } = useApp();
  const navigate = useNavigate();
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    "Private Gems": false,
    "Public Gems": false,
    "Favorites": false,
  });
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: CustomFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        locations: [],
      };

      setCustomFolders((prev) => [...prev, newFolder]);
      setExpandedFolders((prev) => ({
        ...prev,
        [newFolder.name]: true,
      }));
      setNewFolderName("");
      setShowAddFolderDialog(false);
    }
  };

  const addLocationToFolder = (locationId: string, folderId: string) => {
    setCustomFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              locations: folder.locations.includes(locationId)
                ? folder.locations.filter((id) => id !== locationId)
                : [...folder.locations, locationId],
            }
          : folder
      )
    );
  };

  const removeLocationFromFolder = (locationId: string, folderId: string) => {
    setCustomFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              locations: folder.locations.filter((id) => id !== locationId),
            }
          : folder
      )
    );
  };

  const deleteFolder = (folderId: string) => {
    setCustomFolders((prev) => prev.filter((folder) => folder.id !== folderId));
  };

  // Separate locations into private and public (user-uploaded)
  const privateLocations = locations.filter((location) => location.is_private);
  const publicLocations = locations.filter(
    (location) => !location.is_private && location.is_user_uploaded
  );

  // Get community locations (non-private, non-user-uploaded)
  const communityLocations = locations.filter(
    (location) => !location.is_private && !location.is_user_uploaded
  );

  // Get top 3 community gems (for now just taking first 3)
  // In a real app, you might want to sort by popularity/rating first
  const topCommunityGems = communityLocations.slice(0, 3);

  // Get favorited locations
  const favoritedLocations = locations.filter((location) => 
    isLocationFavorited(location.id)
  );

  // Get locations in a specific folder
  const getLocationsInFolder = (folderId: string) => {
    const folder = customFolders.find((f) => f.id === folderId);
    if (!folder) return [];
    return privateLocations.filter((location) =>
      folder.locations.includes(location.id)
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-4 p-2">
        {/* Community Gems Card */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-card/50">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Popular Gems</span>
            </div>
          </div>

          <div className="p-2 space-y-2">
            {topCommunityGems.length > 0 ? (
              topCommunityGems.map((location) => (
                <Button
                  key={location.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2"
                  onClick={() => onLocationSelect(location)}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="truncate font-medium">{location.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {location.area || "Unknown Area"}
                    </span>
                  </div>
                  {isLocationVisited(location.id) && (
                    <Check className="h-4 w-4 ml-auto text-yellow-500" />
                  )}
                </Button>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No community gems yet
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate("/explore")}
            >
              Explore All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Private Gems Folder */}
        <div className="border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center p-4"
            onClick={() => toggleFolder("Private Gems")}
          >
            <div className="flex items-center gap-2">
              {expandedFolders["Private Gems"] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-purple-500" />
              <span>Your Private Gems</span>
              <Badge variant="outline" className="ml-2">
                {privateLocations.length}
              </Badge>
            </div>
          </Button>

          {expandedFolders["Private Gems"] && (
            <div className="p-2">
              <div className="space-y-2">
                {/* Private Locations */}
                {privateLocations.length > 0 ? (
                  privateLocations.map((location) => (
                    <div key={location.id} className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        className="flex-grow justify-start gap-2"
                        onClick={() => onLocationSelect(location)}
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{location.name}</span>
                        {isLocationVisited(location.id) && (
                          <Check className="h-4 w-4 ml-auto text-yellow-500" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No private gems yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public Gems Folder */}
        <div className="border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center p-4"
            onClick={() => toggleFolder("Public Gems")}
          >
            <div className="flex items-center gap-2">
              {expandedFolders["Public Gems"] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-green-500" />
              <span>Your Public Gems</span>
              <Badge variant="outline" className="ml-2">
                {publicLocations.length}
              </Badge>
            </div>
          </Button>

          {expandedFolders["Public Gems"] && (
            <div className="p-2">
              <div className="space-y-2">
                {publicLocations.length > 0 ? (
                  publicLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => onLocationSelect(location)}
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{location.name}</span>
                      {isLocationVisited(location.id) && (
                        <Check className="h-4 w-4 ml-auto text-yellow-500" />
                      )}
                    </Button>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No public gems yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Favorites Folder */}
        <div className="border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center p-4"
            onClick={() => toggleFolder("Favorites")}
          >
            <div className="flex items-center gap-2">
              {expandedFolders["Favorites"] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Favorites</span>
              <Badge variant="outline" className="ml-2">
                {favoritedLocations.length}
              </Badge>
            </div>
          </Button>

          {expandedFolders["Favorites"] && (
            <div className="p-2">
              <div className="space-y-2">
                {favoritedLocations.length > 0 ? (
                  favoritedLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => onLocationSelect(location)}
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{location.name}</span>
                      {isLocationVisited(location.id) && (
                        <Check className="h-4 w-4 ml-auto text-yellow-500" />
                      )}
                    </Button>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No favorites yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom Folders */}
        {customFolders.map((folder) => (
          <div key={folder.id} className="border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center p-4"
              onClick={() => toggleFolder(folder.name)}
            >
              <div className="flex items-center gap-2">
                {expandedFolders[folder.name] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Folder className="h-4 w-4 text-orange-500" />
                <span>{folder.name}</span>
                <Badge variant="outline" className="ml-2">
                  {getLocationsInFolder(folder.id).length}
                </Badge>
              </div>
            </Button>

            {expandedFolders[folder.name] && (
              <div className="p-2">
                <div className="space-y-2">
                  {getLocationsInFolder(folder.id).length > 0 ? (
                    getLocationsInFolder(folder.id).map((location) => (
                      <Button
                        key={location.id}
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => onLocationSelect(location)}
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{location.name}</span>
                        {isLocationVisited(location.id) && (
                          <Check className="h-4 w-4 ml-auto text-yellow-500" />
                        )}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No locations in this folder
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default LocationFolders;