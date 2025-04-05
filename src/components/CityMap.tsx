import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

interface MapProps {
  onLocationSelect?: (location: Location) => void;
}

const CityMap = ({ onLocationSelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const { locations, isLocationVisited } = useApp();
  
  // Use the environment variable instead of hardcoding the token
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || mapInitialized || !locations.length) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 12
      });

      const mapInstance = map.current;

      mapInstance.on('load', () => {
        // Add markers for each location
        locations.forEach(location => {
          const markerElement = document.createElement('div');
          markerElement.className = 'flex items-center justify-center';
          
          // Create a custom marker element
          const markerInner = document.createElement('div');
          markerInner.className = `w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300 ${
            location.isHiddenGem ? 'bg-yellow-500' : (isLocationVisited(location.id) ? 'bg-green-500' : 'bg-primary')
          }`;
          
          // Add an icon inside the marker
          const icon = document.createElement('span');
          icon.className = 'text-white';
          icon.innerHTML = location.isHiddenGem ? '✨' : '📍';
          
          markerInner.appendChild(icon);
          markerElement.appendChild(markerInner);
          
          // Create and add the marker to the map
          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(location.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                  `<h3 class="font-bold text-sm">${location.name}</h3>
                  <p class="text-xs">${location.description}</p>`
                )
            )
            .addTo(mapInstance);
            
          // Add click event for marker
          markerElement.addEventListener('click', () => {
            if (onLocationSelect) {
              onLocationSelect(location);
            }
          });
        });

        setMapInitialized(true);
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        mapInstance.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please check your Mapbox token.');
    }
  }, [mapboxToken, locations, isLocationVisited, onLocationSelect, mapInitialized]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default CityMap;
