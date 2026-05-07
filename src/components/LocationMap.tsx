import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  onLocationSelect: (coords: { latitude: number; longitude: number; address?: string }) => void;
  height?: string;
}

export default function LocationMap({ onLocationSelect, height = '400px' }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');

  // Fix leaflet default icon issue
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latlng = L.latLng(latitude, longitude);

          // Center map on user location
          if (map.current) {
            map.current.setView(latlng, 16);

            // Add marker at current location
            markerRef.current = L.marker(latlng)
              .addTo(map.current)
              .bindPopup('Your current location')
              .openPopup();

            setLocationName('Current Location');
            setLoading(false);

            // Call the callback
            onLocationSelect({
              latitude,
              longitude,
              address: 'Current Location',
            });
          }
        },
        (err) => {
          console.log('Geolocation error:', err);
          setError('Could not access your location. Using default location.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }

    // Handle map click to place marker
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng])
        .addTo(map.current!)
        .bindPopup(`<strong>Selected Location</strong><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
        .openPopup();

      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      // Call the callback
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    };

    if (map.current) {
      map.current.on('click', handleMapClick);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full">
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Detecting your location...
        </div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-3 rounded mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      <div
        ref={mapContainer}
        className="rounded-lg border border-gray-300 w-full"
        style={{ height }}
      />
      {locationName && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
          <strong>Selected Location:</strong> {locationName}
        </div>
      )}
    </div>
  );
}
