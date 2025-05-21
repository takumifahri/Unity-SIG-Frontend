import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../components/MapComponent';
import '../styles/MapComponent.css';

const TentangKami = () => {
  return (
    <div className="w-full bg-white text-gray-800">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Section: Logo & Deskripsi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          {/* Logo */}
          <div className="flex justify-center " data-aos="fade-right" data-aos-duration="1000">
            <img 
              src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              className="w-full max-w-xs md:max-w-sm object-contain"
              // style={{ filter: 'sepia(1)' }} // Menambahkan efek warna coklat
            />
          </div>
          
          <div>
            <h2 className="text-4xl font-bold mb-4">Deskripsi Singkat</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              JR Konveksi adalah solusi terpercaya untuk kebutuhan konveksi Anda. Kami menghadirkan layanan jahit berkualitas tinggi dengan harga terjangkau, dikerjakan oleh tim profesional berpengalaman. Kepuasan pelanggan adalah prioritas kami.
            </p>
          </div>
        </div>

              {/* Section: Foto */}
        <div className="rounded-xl overflow-hidden mb-16 shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1545007805-a44ee83438fa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="JR Konveksi" 
            className="w-full h-64 object-cover"
          />
        </div>

              {/* Section: Kutipan */}
        <div className="text-center mb-20">
          <p className="text-2xl italic text-gray-700">"Kutipan singkat dari JR Konveksi"</p>
        </div>

        {/* Section: Jasa Kami */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-10">Jasa Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((index) => (
              <div 
                key={index} 
                className="bg-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="w-28 h-28 bg-gray-300 rounded-full mx-auto flex items-center justify-center text-lg font-semibold text-gray-700 mb-4">
                  Jasa {index}
                </div>
                <p className="text-gray-600">Deskripsi singkat jasanya</p>
              </div>
            ))}
          </div>
        </section>
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
