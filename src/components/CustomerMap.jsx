import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePelanggan } from '../context/PelangganContext';
import '../styles/map.css';

// Custom marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CustomerMap = () => {
  const { customers } = usePelanggan();

  return (
    <div className="map-container">
      <MapContainer
        center={[-7.2575, 112.7521]} // Koordinat pusat Surabaya
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {customers.map((customer) => (
          <Marker 
            key={customer.id} 
            position={customer.coordinates}
            icon={icon}
          >
            <Popup>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{customer.name}</h3>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <span className="font-semibold">Alamat:</span><br/>
                    {customer.address}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Telepon:</span><br/>
                    {customer.phone}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Total Pesanan:</span><br/>
                    {customer.totalOrders} pesanan
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CustomerMap; 