import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '../types/location';
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

        // Add locations source and layer
        newMap.addSource('locations', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        newMap.addLayer({
          id: 'locations',
          type: 'circle',
          source: 'locations',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'case',
              ['get', 'is_hidden_gem'],
              '#4ade80', // green-400 for hidden gems
              '#fbbf24' // yellow-400 for completed gems
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': [
              'case',
              ['get', 'is_hidden_gem'],
              'rgba(74, 222, 128, 0.7)', // green-400 with opacity for hidden gems
              'rgba(250, 204, 21, 0.7)' // yellow-400 with opacity for completed gems
            ]
          }
        });

        // Add click handler for locations
        newMap.on('click', 'locations', (e) => {
          if (e.features && e.features[0] && onLocationSelect) {
            const feature = e.features[0];
            const location = locations.find(loc => loc.id === feature.properties.id);
            if (location) {
              onLocationSelect(location);
            }
          }
        });

        // Change cursor on hover
        newMap.on('mouseenter', 'locations', () => {
          newMap.getCanvas().style.cursor = 'pointer';
        });
        newMap.on('mouseleave', 'locations', () => {
          newMap.getCanvas().style.cursor = '';
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

  // Update locations when they change or map is initialized
  useEffect(() => {
    if (!map.current || !mapInitialized || !locations.length) return;

    try {
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: locations.map(location => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            properties: {
              id: location.id,
              name: location.name,
              description: location.description,
              is_hidden_gem: location.is_hidden_gem,
              is_visited: isLocationVisited(location.id)
            }
          }))
        });
      }
    } catch (error) {
      console.error('Error updating locations:', error);
      toast.error('Failed to update location markers');
    }
  }, [locations, mapInitialized, isLocationVisited]);

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
          <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0px_0px_4px_2px_rgba(250,204,21,0.7)]" />
          <div className="text-sm text-zinc-300">Completed Gem</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0px_0px_4px_2px_rgba(74,222,128,0.7)]" />
          <div className="text-sm text-zinc-300">Hidden Gem</div>
        </div>
      </div>
    </div>
  );
};

export default CityMap;
