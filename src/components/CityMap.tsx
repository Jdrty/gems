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
  
  const mapboxToken = import.meta.env.REACT_MAPBOX_ACCESS_TOKEN;

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || mapInitialized || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Clear any existing content
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '';
      }

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 12
      });

      newMap.on('load', () => {
        setMapInitialized(true);
        map.current = newMap;
      });

      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        newMap.remove();
        map.current = null;
        setMapInitialized(false);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }
  }, [mapboxToken]);

  // Add markers when locations change or map is initialized
  useEffect(() => {
    if (!map.current || !mapInitialized || !locations.length) return;

    try {
      // Clear existing markers if any
      const markers = document.getElementsByClassName('mapboxgl-marker');
      while (markers.length > 0) {
        markers[0].remove();
      }

      // Add new markers
      locations.forEach(location => {
        const markerElement = document.createElement('div');
        markerElement.className = 'flex items-center justify-center';
        
        const markerInner = document.createElement('div');
        markerInner.className = `w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300 ${
          location.isHiddenGem ? 'bg-yellow-500' : (isLocationVisited(location.id) ? 'bg-green-500' : 'bg-primary')
        }`;
        
        const icon = document.createElement('span');
        icon.className = 'text-white';
        icon.innerHTML = location.isHiddenGem ? '✨' : '📍';
        
        markerInner.appendChild(icon);
        markerElement.appendChild(markerInner);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat(location.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                `<h3 class="font-bold text-sm">${location.name}</h3>
                <p class="text-xs">${location.description}</p>`
              )
          )
          .addTo(map.current);
          
        markerElement.addEventListener('click', () => {
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        });
      });
    } catch (error) {
      console.error('Error adding markers:', error);
      toast.error('Failed to add location markers');
    }
  }, [locations, mapInitialized, isLocationVisited, onLocationSelect]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-card">
        <div className="text-center p-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
          <p className="text-sm text-muted-foreground">Mapbox token is not configured properly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default CityMap;
