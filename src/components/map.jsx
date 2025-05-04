import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ customers }) => {
  useEffect(() => {
    // Kustomisasi icon marker
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Inisialisasi peta
    const map = L.map('map').setView([-7.2575, 112.7521], 13);

    // Tambahkan tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Simpan referensi marker
    const markers = [];

    // Tambahkan marker untuk setiap pelanggan
    customers.forEach(customer => {
      const marker = L.marker(customer.coordinates, { icon: customIcon })
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
        .addTo(map);
      
      markers.push(marker);
    });

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.remove());
      map.remove();
    };
  }, [customers]); // Re-render ketika customers berubah

  return null;
};

export default Map;