import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Location } from '@/types/location';
import { User, MapPin, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { locations, loading, visitedLocations, isGuestMode } = useApp();
  const { user } = useAuth();
  
  // Filter visited locations
  const userVisitedLocations = locations.filter(loc => 
    visitedLocations.includes(loc.id)
  );

  if (isGuestMode) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-col items-center text-center gap-4 py-12">
          <UserX className="h-16 w-16 text-amber-500" />
          <h1 className="text-2xl font-bold">Guest Mode</h1>
          <p className="text-muted-foreground mb-4 max-w-md">
            You're currently in guest mode. Your visited locations won't be saved when you leave. 
            Sign in to track your exploration progress.
          </p>
          <Link to="/auth">
            <Button>
              Sign In or Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      </div>

      {loading ? (
        <div className="space-y-8">
          <Skeleton className="h-[160px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-6 border rounded-lg bg-card shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Account Info</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Member since:</span> {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="text-primary w-6 h-6" />
                Places Visited
              </h2>
              
              {userVisitedLocations.length === 0 ? (
                <div className="text-center py-12 bg-card/30 rounded-lg border">
                  <h3 className="text-lg font-medium mb-2">No places visited yet</h3>
                  <p className="text-muted-foreground">
                    Explore locations around the city and check in to see them here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userVisitedLocations.map(location => (
                    <LocationCard 
                      key={location.id} 
                      location={location}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LocationCardProps {
  location: Location;
}

const LocationCard = ({ location }: LocationCardProps) => {
  return (
    <div className="p-4 rounded-lg border bg-card shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{location.name}</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {location.description}
      </p>
      
      <div className="flex items-center justify-between mt-auto">
        <Badge variant="secondary">{location.category_id}</Badge>
      </div>
    </div>
  );
};

export default Profile;
