import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Folder } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddLocationButtonProps {
  onLocationAdded?: (coordinates: [number, number]) => void;
}

const AddLocationButton = ({ onLocationAdded }: AddLocationButtonProps) => {
  const { addLocation } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [isPrivate, setIsPrivate] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [customFolders, setCustomFolders] = useState<{id: string, name: string}[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!latitude.trim() || !longitude.trim()) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid numbers for coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }
    
    try {
      const newLocation = {
        name: title,
        description: description || null,
        address: null,
        latitude: lat,
        longitude: lng,
        category_id: null,
        is_hidden_gem: true,
        difficulty_to_find: parseInt(difficulty),
        image_url: null,
        area: null,
        is_private: isPrivate
      };
      
      await addLocation(newLocation);
      
      // Reset form
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setDifficulty('1');
      setIsPrivate(true);
      setSelectedFolder('');
      
      // Close dialog
      setOpen(false);
      
      // Notify parent component about the new location's coordinates
      if (onLocationAdded) {
        onLocationAdded([lng, lat]);
      }
      
      // If private and a folder is selected, add to that folder
      if (isPrivate && selectedFolder) {
        toast.success(`Added to folder: ${selectedFolder}`);
      }
      
      toast.success('Location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim()
      };
      
      setCustomFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowAddFolderDialog(false);
      setSelectedFolder(newFolder.name);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Location
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Enter the details for your new hidden gem location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter location title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter location description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Enter latitude"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Enter longitude"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty to Find</Label>
                <RadioGroup
                  value={difficulty}
                  onValueChange={setDifficulty}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="difficulty-1" />
                    <Label htmlFor="difficulty-1">Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="difficulty-2" />
                    <Label htmlFor="difficulty-2">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="difficulty-3" />
                    <Label htmlFor="difficulty-3">Hard</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label>Location Type</Label>
                <RadioGroup
                  value={isPrivate ? "private" : "public"}
                  onValueChange={(value) => setIsPrivate(value === "private")}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private Gem</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public Gem</Label>
                  </div>
                </RadioGroup>
              </div>
              <p className="text-xs text-muted-foreground">
                {difficulty === '1' && 'Very easy to find'}
                {difficulty === '2' && 'Easy to find'}
                {difficulty === '3' && 'Moderate difficulty'}
                {difficulty === '4' && 'Hard to find'}
                {difficulty === '5' && 'Very hard to find'}
              </p>
              {isPrivate && (
                <div className="grid gap-2">
                  <Label htmlFor="folder">Add to Folder</Label>
                  <div className="flex gap-2">
                    <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {customFolders.length > 0 ? (
                          customFolders.map(folder => (
                            <SelectItem key={folder.id} value={folder.name}>
                              {folder.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-folders" disabled>No folders available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:text-green-600"
                      onClick={() => setShowAddFolderDialog(true)}
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">Add Location</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Folder Creation Dialog */}
      <Dialog open={showAddFolderDialog} onOpenChange={setShowAddFolderDialog}>
        <DialogContent className="sm:max-w-[425px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddFolder} className="bg-green-500 hover:bg-green-600 text-white">Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddLocationButton; 