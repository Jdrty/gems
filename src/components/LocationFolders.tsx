import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppLocation } from "@/types/location";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  ChevronDown,
  ChevronRight,
  MapPin,
  FolderPlus,
  Folder,
  Plus,
  Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface CustomFolder {
  id: string;
  name: string;
  locations: string[]; // Array of location IDs
}

interface LocationFoldersProps {
  onLocationSelect: (location: AppLocation) => void;
}

const LocationFolders = ({ onLocationSelect }: LocationFoldersProps) => {
  const { locations, isLocationVisited, deleteLocation, favoriteLocations, isLocationFavorited } = useApp();
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    "Private Gems": true,
    "Public Gems": true,
    "Favorites": true,
  });
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
  const privateLocations = locations.filter(location => location.is_private);
  const publicLocations = locations.filter(location => !location.is_private && location.is_user_uploaded);

  // Get locations in a specific folder
  const getLocationsInFolder = (folderId: string) => {
    const folder = customFolders.find((f) => f.id === folderId);
    if (!folder) return [];
    return privateLocations.filter((location) =>
      folder.locations.includes(location.id)
    );
  };

  // Get favorited locations
  const favoritedLocations = locations.filter(location => isLocationFavorited(location.id));

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteLocation(locationId);
      setShowDeleteDialog(false);
      setLocationToDelete(null);
      setDontAskAgain(false);
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const openDeleteDialog = (locationId: string) => {
    setLocationToDelete(locationId);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-4">
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
          <ScrollArea className="h-[200px] p-2">
            <div className="space-y-2">
              {favoritedLocations.length > 0 ? (
                favoritedLocations.map((location) => (
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
                    {location.is_user_uploaded && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(location.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No favorite gems yet
                </div>
              )}
            </div>
          </ScrollArea>
        )}
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
            <span>Private Gems</span>
            <Badge variant="outline" className="ml-2">
              {privateLocations.length}
            </Badge>
          </div>
        </Button>

        {expandedFolders["Private Gems"] && (
          <ScrollArea className="h-[300px] p-2">
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
                    {location.is_user_uploaded && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(location.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No private gems yet
                </div>
              )}
            </div>
          </ScrollArea>
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
            <span>Public Gems</span>
            <Badge variant="outline" className="ml-2">
              {publicLocations.length}
            </Badge>
          </div>
        </Button>

        {expandedFolders["Public Gems"] && (
          <ScrollArea className="h-[200px] p-2">
            <div className="space-y-2">
              {publicLocations.length > 0 ? (
                publicLocations.map((location) => (
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
                    {location.is_user_uploaded && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(location.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No public gems yet
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Gem</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gem? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dont-ask-again" 
                checked={dontAskAgain} 
                onCheckedChange={(checked) => setDontAskAgain(checked as boolean)}
              />
              <Label htmlFor="dont-ask-again" className="text-sm text-muted-foreground">
                Don't ask again
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setLocationToDelete(null);
                setDontAskAgain(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => locationToDelete && handleDeleteLocation(locationToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationFolders;