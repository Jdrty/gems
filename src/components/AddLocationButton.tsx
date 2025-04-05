import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Star } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

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
  // Initialize state from localStorage or default values
  const [formState, setFormState] = useState<FormState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : {
      open: false,
      title: '',
      description: '',
      latitude: '',
      longitude: '',
      difficulty: 3
    };
  });

  const { addLocation } = useApp();

  // Save form state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formState.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formState.latitude.trim() || !formState.longitude.trim()) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    const lat = parseFloat(formState.latitude);
    const lng = parseFloat(formState.longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    // Create the new location
    const newLocation = {
      name: formState.title,
      description: formState.description || null,
      address: null,
      latitude: lat,
      longitude: lng,
      category_id: null,
      is_hidden_gem: true, // All locations are hidden gems
      difficulty_to_find: formState.difficulty,
      image_url: null,
      area: null
    };
    
    // Add the location to the app context
    await addLocation(newLocation);
    
    // Call the onLocationAdded callback with the new coordinates
    if (onLocationAdded) {
      onLocationAdded([lng, lat]);
    }
    
    // Clear form state and localStorage
    setFormState({
      open: false,
      title: '',
      description: '',
      latitude: '',
      longitude: '',
      difficulty: 3
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Dialog 
      open={formState.open} 
      onOpenChange={(open) => setFormState(prev => ({ ...prev, open }))}
    >
      <DialogTrigger asChild>
        <Button className="w-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter location name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this location"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={formState.latitude}
                onChange={(e) => setFormState(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g. 43.6532"
                type="number"
                step="any"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={formState.longitude}
                onChange={(e) => setFormState(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g. -79.3832"
                type="number"
                step="any"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Difficulty to Find</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, difficulty: value }))}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    value <= formState.difficulty 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Star className="h-4 w-4" />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {formState.difficulty === 1 && 'Very easy to find'}
              {formState.difficulty === 2 && 'Easy to find'}
              {formState.difficulty === 3 && 'Moderate difficulty'}
              {formState.difficulty === 4 && 'Hard to find'}
              {formState.difficulty === 5 && 'Very hard to find'}
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFormState(prev => ({ ...prev, open: false }));
                localStorage.removeItem(STORAGE_KEY);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              <MapPin className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationButton; 