import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

interface RouteDisplayProps {
  requestLocation: {
    latitude: number;
    longitude: number;
    text?: string;
  };
  volunteerLocation: {
    latitude: number;
    longitude: number;
  } | null;
  height?: string;
}

export default function RouteDisplay({
  requestLocation,
  volunteerLocation,
  height = '400px',
}: RouteDisplayProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routingControl = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView(
      [requestLocation.latitude, requestLocation.longitude],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Fix leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Add marker for request location
    const requestMarker = L.marker([requestLocation.latitude, requestLocation.longitude])
      .addTo(map.current)
      .bindPopup(`<strong>Request Location</strong><br>${requestLocation.text || 'Help Request'}`)
      .openPopup();

    // If volunteer location exists, show route
    if (volunteerLocation && map.current) {
      // Add marker for volunteer location
      L.marker([volunteerLocation.latitude, volunteerLocation.longitude])
        .addTo(map.current)
        .bindPopup(`<strong>Your Location</strong>`)
        .openPopup();

      // Create routing
      routingControl.current = (L as any).Routing.control({
        waypoints: [
          L.latLng(volunteerLocation.latitude, volunteerLocation.longitude),
          L.latLng(requestLocation.latitude, requestLocation.longitude),
        ],
        routeWhileDragging: true,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: 'blue', opacity: 0.7, weight: 5 }],
        },
      }).addTo(map.current);

      // Fit bounds to show entire route
      if (map.current) {
        const group = new L.FeatureGroup([
          L.marker([volunteerLocation.latitude, volunteerLocation.longitude]),
          L.marker([requestLocation.latitude, requestLocation.longitude]),
        ]);
        map.current.fitBounds(group.getBounds().pad(0.1));
      }
    } else {
      // Just show request location
      if (map.current) {
        map.current.setView(
          [requestLocation.latitude, requestLocation.longitude],
          14
        );
      }
    }

    // Cleanup
    return () => {
      if (routingControl.current) {
        routingControl.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [requestLocation, volunteerLocation]);

  return (
    <div className="w-full">
      <div
        ref={mapContainer}
        className="rounded-lg border border-gray-300 w-full"
        style={{ height }}
      />
      {volunteerLocation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Route Information:</strong>
          <p className="mt-1">
            From: {volunteerLocation.latitude.toFixed(4)}, {volunteerLocation.longitude.toFixed(4)}
          </p>
          <p>
            To: {requestLocation.latitude.toFixed(4)}, {requestLocation.longitude.toFixed(4)}
          </p>
        </div>
      )}
      {!volunteerLocation && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          💡 Your location will be detected when you accept the request to show the route.
        </div>
      )}
    </div>
  );
}
