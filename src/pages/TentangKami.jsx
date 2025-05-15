import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../components/MapComponent';
import '../styles/MapComponent.css';

const TentangKami = () => {
  return (
    <div className="w-full">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Logo Section */}
          <div className="w-full flex items-center justify-center">
            <img 
              src="/assets/logo.png" 
              alt="JR Konveksi Logo" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
          
          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Deskripsi Singkat</h2>
            <p className="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        {/* Photo Section */}
        <div className="bg-gray-200 h-64 mb-12 rounded-lg flex items-center justify-center">
          <span className="text-2xl text-gray-600">Foto</span>
        </div>

        {/* Quote Section */}
        <div className="text-center mb-12">
          <p className="text-xl italic">"Kutipan singkat dari JR konveksi"</p>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Jasa Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-gray-200 rounded-full aspect-square flex flex-col items-center justify-center p-4">
                <div className="text-xl mb-2">Jasa {index}</div>
                <p className="text-sm text-center">Deskripsi singkat jasanya</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Lokasi />
    </div>
  );
};

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
      
      <MapComponent />
    </div>
  );
};

export default TentangKami;