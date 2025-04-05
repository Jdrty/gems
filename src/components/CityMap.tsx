import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
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

export interface MapRef {
  centerOnCoordinates: (coordinates: [number, number]) => void;
}

const CityMap = forwardRef<MapRef, MapProps>(({ onLocationSelect }, ref) => {
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

  // Expose the centerOnCoordinates method through the ref
  useImperativeHandle(ref, () => ({
    centerOnCoordinates: (coordinates: [number, number]) => {
      console.log('CityMap: Attempting to center on coordinates:', coordinates);
      if (map.current) {
        console.log('CityMap: Map instance available, flying to coordinates');
        map.current.flyTo({
          center: coordinates,
          zoom: 16,
          pitch: 52,
          bearing: -20,
          duration: 2000,
          essential: true
        });
      } else {
        console.log('CityMap: Map instance not available');
      }
    }
  }));

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
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              8, // larger radius when hovered
              6  // default radius
            ],
            'circle-color': [
              'case',
              ['get', 'is_visited'],
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#fde047', // yellow-300 for hovered visited gems
                '#fbbf24'  // yellow-400 for visited gems
              ],
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#86efac', // green-300 for hovered hidden gems
                '#4ade80'  // green-400 for hidden gems
              ]
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': [
              'case',
              ['get', 'is_visited'],
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(253, 224, 71, 0.9)',  // brighter yellow with opacity for hovered visited gems
                'rgba(250, 204, 21, 0.7)'   // yellow-400 with opacity for visited gems
              ],
              [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(134, 239, 172, 0.9)', // brighter green with opacity for hovered hidden gems
                'rgba(74, 222, 128, 0.7)'   // green-400 with opacity for hidden gems
              ]
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

        // Add click handler for empty areas of the map
        newMap.on('click', (e) => {
          // Check if the click was on a location
          const features = newMap.queryRenderedFeatures(e.point, { layers: ['locations'] });
          if (features.length === 0 && onLocationSelect) {
            // If no location was clicked, clear the selected location
            onLocationSelect(null);
          }
        });

        // Add hover effect and popup
        let popup: mapboxgl.Popup | null = null;
        let hoveredStateId: string | null = null;

        newMap.on('mousemove', 'locations', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const location = locations.find(loc => loc.id === feature.properties.id);
            
            if (hoveredStateId !== null) {
              newMap.setFeatureState(
                { source: 'locations', id: hoveredStateId },
                { hover: false }
              );
            }

            // Only apply hover effect if the location is not visited
            if (location && !isLocationVisited(location.id)) {
              hoveredStateId = feature.id as string;
              newMap.setFeatureState(
                { source: 'locations', id: hoveredStateId },
                { hover: true }
              );
            } else {
              hoveredStateId = null;
            }

            // Create or update popup
            if (location) {
              const coordinates = [location.longitude, location.latitude];
              
              if (popup) {
                popup.remove();
              }

              popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 25
              })
                .setLngLat(coordinates as [number, number])
                .setHTML(`
                  <div class="bg-zinc-900/95 p-3 rounded-lg border border-zinc-800 min-w-[200px]">
                    <h3 class="font-bold text-sm text-zinc-100 mb-1">${location.name}</h3>
                    <p class="text-xs text-zinc-400">${location.description || ''}</p>
                    ${isLocationVisited(location.id) ? '<div class="mt-2 text-xs text-yellow-400">✨ Visited</div>' : ''}
                  </div>
                `)
                .addTo(newMap);
            }
          }
        });

        newMap.on('mouseleave', 'locations', () => {
          if (hoveredStateId !== null) {
            newMap.setFeatureState(
              { source: 'locations', id: hoveredStateId },
              { hover: false }
            );
            hoveredStateId = null;
          }
          if (popup) {
            popup.remove();
            popup = null;
          }
          newMap.getCanvas().style.cursor = '';
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
    if (!map.current || !mapInitialized) return;

    try {
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        // Create a unique ID for each feature to ensure proper click handling
        const features = locations.map(location => ({
          type: 'Feature' as const,
          id: location.id, // Use the location ID as the feature ID
          geometry: {
            type: 'Point' as const,
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            id: location.id,
            name: location.name,
            description: location.description,
            is_hidden_gem: location.is_hidden_gem,
            is_visited: isLocationVisited(location.id)
          }
        }));

        source.setData({
          type: 'FeatureCollection',
          features
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
          <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0px_0px_4px_2px_rgba(74,222,128,0.7)]" />
          <div className="text-sm text-zinc-300">Hidden Gem</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0px_0px_4px_2px_rgba(250,204,21,0.7)]" />
          <div className="text-sm text-zinc-300">Visited</div>
        </div>
      </div>
    </div>
  );
});

export default CityMap;
