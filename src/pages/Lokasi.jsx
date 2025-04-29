import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../components/MapComponent';
import '../styles/MapComponent.css';

const Lokasi = () => {
  // State untuk menyimpan data input
  const [namaAlamat, setNamaAlamat] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  // State untuk koordinat dan hasil geocoding
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');

  // Komponen pembantu untuk menangani klik pada peta
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition(e.latlng);
        // Lakukan reverse geocoding via Nominatim (OSM)
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setAddress(data.display_name);
            }
          })
          .catch((error) => console.error('Error geocoding:', error));
      },
    });
    return null;
  };

  // Handler saat form disubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataDikirim = {
      namaAlamat,
      nomorTelepon,
      alamatLengkap,
      latitude: position ? position.lat : null,
      longitude: position ? position.lng : null,
      address, // hasil reverse geocoding
    };
    console.log('Data dikirim:', dataDikirim);
    // TODO: kirim data ke server atau proses selanjutnya
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Lokasi User</h2>
      
      <MapComponent />
    </div>
  );
};

export default Lokasi;
