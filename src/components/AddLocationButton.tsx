import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define categories for location types
const CATEGORIES = [
  { id: '1', name: 'Restaurant' },
  { id: '2', name: 'Cafe' },
  { id: '3', name: 'Bar' },
  { id: '4', name: 'Park' },
  { id: '5', name: 'Museum' },
  { id: '6', name: 'Gallery' },
  { id: '7', name: 'Shopping' },
  { id: '8', name: 'Entertainment' },
  { id: '9', name: 'Landmark' },
  { id: '10', name: 'Nature' },
  { id: '11', name: 'Viewpoint' },
  { id: '12', name: 'Other' }
];

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
  const [category, setCategory] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        
        toast.success('Current location retrieved successfully');
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your current location');
        setIsLoadingLocation(false);
      }
    );
  };

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
        category_id: category || null,
        is_hidden_gem: true,
        difficulty_to_find: parseInt(difficulty),
        image_url: null,
        area: null,
        is_private: isPrivate,
        is_user_uploaded: true
      };
      
      await addLocation(newLocation);
      
      // Reset form
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setDifficulty('1');
      setIsPrivate(true);
      setCategory('');
      
      // Close dialog
      setOpen(false);
      
      // Notify parent component about the new location's coordinates
      if (onLocationAdded) {
        onLocationAdded([lng, lat]);
      }
      
      toast.success('Location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    }
  };

  return (
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
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter location description"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="coordinates">Coordinates</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  <MapPin className="h-4 w-4" />
                  {isLoadingLocation ? 'Getting location...' : 'Use current location'}
                </Button>
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Type of Place</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <DialogFooter>
            <Button type="submit">Add Location</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationButton; 