import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

interface AddLocationButtonProps {
  onLocationAdded?: (coordinates: [number, number]) => void;
}

// Define the form state type
interface FormState {
  open: boolean;
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  difficulty: number;
}

const STORAGE_KEY = 'addLocationFormState';

const AddLocationButton = ({ onLocationAdded }: AddLocationButtonProps) => {
  const { addLocation } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [isPrivate, setIsPrivate] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formState.latitude.trim() || !formState.longitude.trim()) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    const lat = parseFloat(formState.latitude);
    const lng = parseFloat(formState.longitude);
    
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
    <Dialog 
      open={formState.open} 
      onOpenChange={(open) => setFormState(prev => ({ ...prev, open }))}
    >
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
                  placeholder="e.g., 43.6532"
                  type="number"
                  step="any"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -79.3832"
                  type="number"
                  step="any"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Input
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                type="number"
                min="1"
                max="5"
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <RadioGroup 
                value={isPrivate ? "private" : "public"} 
                onValueChange={(value) => setIsPrivate(value === "private")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private Gem (only visible to you)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public Gem (visible to everyone)</Label>
                </div>
              </RadioGroup>
            </div>
            <p className="text-xs text-muted-foreground">
              {formState.difficulty === 1 && 'Very easy to find'}
              {formState.difficulty === 2 && 'Easy to find'}
              {formState.difficulty === 3 && 'Moderate difficulty'}
              {formState.difficulty === 4 && 'Hard to find'}
              {formState.difficulty === 5 && 'Very hard to find'}
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