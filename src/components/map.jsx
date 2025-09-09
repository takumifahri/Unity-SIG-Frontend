import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ customers }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-7.2575, 112.7521], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });

      // Add markers for customers
      const markers = customers.map(customer => {
        return L.marker(customer.coordinates)
          .bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">${customer.name}</h3>
              <p class="text-gray-600 mb-1">
                <span class="font-semibold">Alamat:</span><br/>
                ${customer.address}
              </p>
              <p class="text-gray-600">
                <span class="font-semibold">Telepon:</span><br/>
                ${customer.phone}
              </p>
            </div>
          `, {
            className: 'custom-popup'
          })
          .addTo(mapInstanceRef.current);
      });

      // Fit bounds if there are markers
      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customers]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default Map;