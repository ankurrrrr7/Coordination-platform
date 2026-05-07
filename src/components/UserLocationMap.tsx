import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { authAPI } from '../lib/api';

interface UserLocationMapProps {
  userId?: string;
  height?: string;
  showRealTime?: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function UserLocationMap({
  userId,
  height = '350px',
  showRealTime = true,
}: UserLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fix leaflet default icon issue
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });

  // Update location on backend
  const updateLocationOnBackend = async (coords: { latitude: number; longitude: number }) => {
    if (!userId) return;
    try {
      await authAPI.updateLocation(coords);
    } catch (err) {
      console.log('Failed to update location on backend:', err);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Get initial location
    if (navigator.geolocation) {
      if (showRealTime) {
        // Watch position for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const locationData = {
              latitude,
              longitude,
              accuracy,
              timestamp: Date.now(),
            };

            setLocation(locationData);
            setLoading(false);
            setTracking(true);
            setError('');

            // Update marker and circle on map
            updateMapMarker(latitude, longitude, accuracy);

            // Update backend periodically (every 10 seconds)
            updateLocationOnBackend({ latitude, longitude });
          },
          (err) => {
            console.log('Geolocation watch error:', err);
            setError('Could not access your location.');
            setLoading(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          }
        );
      } else {
        // Get position once
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const locationData = {
              latitude,
              longitude,
              accuracy,
              timestamp: Date.now(),
            };

            setLocation(locationData);
            setLoading(false);
            setError('');

            // Update marker on map
            updateMapMarker(latitude, longitude, accuracy);

            updateLocationOnBackend({ latitude, longitude });
          },
          (err) => {
            console.log('Geolocation error:', err);
            setError('Could not access your location.');
            setLoading(false);
          }
        );
      }
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [showRealTime, userId]);

  const updateMapMarker = (latitude: number, longitude: number, accuracy: number) => {
    if (!map.current) return;

    const latlng = L.latLng(latitude, longitude);

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng)
        .addTo(map.current)
        .bindPopup('Your current location')
        .openPopup();
    }

    // Update or create accuracy circle
    if (circleRef.current) {
      circleRef.current.setLatLng(latlng).setRadius(accuracy);
    } else {
      circleRef.current = L.circle(latlng, {
        radius: accuracy,
        color: 'blue',
        fillColor: '#007bff',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map.current);
    }

    // Center map on location
    map.current.setView(latlng, 15);
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded mb-4">
          📍 Detecting your location...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4">
          ⚠️ {error}
        </div>
      )}
      <div
        ref={mapContainer}
        className="rounded-lg border border-gray-300 w-full"
        style={{ height }}
      />
      {location && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
          <div className="flex items-center justify-between">
            <div>
              <strong>Your Location:</strong>
              <p className="text-xs text-gray-600 mt-1">
                Lat: {location.latitude.toFixed(5)} | Lon: {location.longitude.toFixed(5)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Accuracy: ±{Math.round(location.accuracy)}m
              </p>
            </div>
            {showRealTime && (
              <div className="text-right">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    tracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {tracking ? 'Tracking' : 'Stopped'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
