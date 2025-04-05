
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star } from 'lucide-react';

const StatsDisplay = () => {
  const { locations, visitedLocations } = useApp();
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalVisited: 0,
    completionPercentage: 0,
    totalHiddenGems: 0,
    discoveredGems: 0,
    gemCompletionPercentage: 0
  });

  useEffect(() => {
    if (locations.length) {
      // Calculate stats based on locations and visited locations
      const totalHiddenGems = locations.filter(loc => loc.isHiddenGem).length;
      const discoveredGems = locations
        .filter(loc => loc.isHiddenGem && visitedLocations.includes(loc.id))
        .length;

      setStats({
        totalLocations: locations.length,
        totalVisited: visitedLocations.length,
        completionPercentage: Math.round((visitedLocations.length / locations.length) * 100) || 0,
        totalHiddenGems,
        discoveredGems,
        gemCompletionPercentage: Math.round((discoveredGems / totalHiddenGems) * 100) || 0
      });
    }
  }, [locations, visitedLocations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Places Visited
            </h3>
            <p className="text-sm text-muted-foreground">Your exploration progress</p>
          </div>
          <div className="text-3xl font-bold">{stats.completionPercentage}%</div>
        </div>
        
        <Progress value={stats.completionPercentage} className="h-2 mb-2" />
        
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{stats.totalVisited} visited</span>
          <span>{stats.totalLocations} total</span>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5" />
              Hidden Gems
            </h3>
            <p className="text-sm text-muted-foreground">Special discoveries</p>
          </div>
          <div className="text-3xl font-bold">{stats.gemCompletionPercentage}%</div>
        </div>
        
        <Progress value={stats.gemCompletionPercentage} className="h-2 mb-2 bg-muted [&>div]:bg-yellow-500" />
        
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{stats.discoveredGems} discovered</span>
          <span>{stats.totalHiddenGems} total</span>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
