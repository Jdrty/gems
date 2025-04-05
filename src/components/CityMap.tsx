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
  
  // Toronto coordinates
  const [center, setCenter] = useState<[number, number]>([-79.3832, 43.6532]);
  const [zoom, setZoom] = useState(15.5);
  const [pitch, setPitch] = useState(52);
  const [bearing, setBearing] = useState(-20);
  
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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
        center: center,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        antialias: true // Enable antialiasing for smoother rendering
      });

      newMap.on('load', () => {
        // Add 3D building layer
        newMap.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 14,
          'paint': {
            'fill-extrusion-color': '#2a2a2a',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.8
          }
        });

        setMapInitialized(true);
        map.current = newMap;
      });

      // Track map movement
      newMap.on('move', () => {
        if (newMap) {
          const mapCenter = newMap.getCenter();
          const mapZoom = newMap.getZoom();
          const mapPitch = newMap.getPitch();
          const mapBearing = newMap.getBearing();

          setCenter([mapCenter.lng, mapCenter.lat]);
          setZoom(mapZoom);
          setPitch(mapPitch);
          setBearing(mapBearing);
        }
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
        const statusClass = location.isHiddenGem 
          ? 'bg-yellow-400 shadow-[0px_0px_4px_2px_rgba(250,204,21,0.7)]' 
          : isLocationVisited(location.id)
            ? 'bg-green-400 shadow-[0px_0px_4px_2px_rgba(74,222,128,0.7)]'
            : 'bg-primary shadow-[0px_0px_4px_2px_rgba(59,130,246,0.7)]';
            
        markerInner.className = `w-3 h-3 rounded-full ${statusClass} flex items-center justify-center transition-all duration-300`;
        
        markerElement.appendChild(markerInner);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat(location.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                `<div class="bg-zinc-900/95 p-2 rounded-lg border border-zinc-800">
                  <h3 class="font-bold text-sm text-zinc-100">${location.name}</h3>
                  <p class="text-xs text-zinc-400">${location.description}</p>
                </div>`
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
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg relative">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="bg-zinc-900/90 absolute bottom-8 left-4 flex flex-col gap-2 p-3 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary shadow-[0px_0px_4px_2px_rgba(59,130,246,0.7)]" />
          <div className="text-sm text-zinc-300">Available</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0px_0px_4px_2px_rgba(74,222,128,0.7)]" />
          <div className="text-sm text-zinc-300">Visited</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0px_0px_4px_2px_rgba(250,204,21,0.7)]" />
          <div className="text-sm text-zinc-300">Hidden Gem</div>
        </div>
      </div>
    </div>
  );
};

export default CityMap;
