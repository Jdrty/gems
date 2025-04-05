import { useState } from 'react';
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

const AddLocationButton = ({ onLocationAdded }: AddLocationButtonProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const { locations } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
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
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    // In a real app, you would save this to your database
    // For now, we'll just show a success message
    toast.success('Location added successfully!');
    
    // Call the onLocationAdded callback with the new coordinates
    if (onLocationAdded) {
      onLocationAdded([lng, lat]);
    }
    
    // Reset form and close dialog
    setTitle('');
    setDescription('');
    setLatitude('');
    setLongitude('');
    setDifficulty(3);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter location name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this location"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 43.6532"
                type="number"
                step="any"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
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
                  onClick={() => setDifficulty(value)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    value <= difficulty 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Star className="h-4 w-4" />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {difficulty === 1 && 'Very easy to find'}
              {difficulty === 2 && 'Easy to find'}
              {difficulty === 3 && 'Moderate difficulty'}
              {difficulty === 4 && 'Hard to find'}
              {difficulty === 5 && 'Very hard to find'}
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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