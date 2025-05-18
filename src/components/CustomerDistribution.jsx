import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Komponen utama Peta Sebaran Pelanggan
const CustomerDistribution = () => {
  // State untuk menyimpan data pelanggan
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  
  // State untuk pencarian lokasi
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // State untuk form tambah pelanggan
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    address: '',
    phone: '',
  });

  // State untuk koordinat yang dipilih dari peta
  const [selectedCoordinates, setSelectedCoordinates] = useState([-6.2, 106.8]); // Default ke Jakarta

  // Fetch data pelanggan dari API
  const getCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Transformasi data untuk memastikan format yang benar untuk peta
      const formattedCustomers = res.data.data.map(customer => ({
        ...customer,
        coordinates: [
          parseFloat(customer.latitude) || 0, 
          parseFloat(customer.longitude) || 0
        ]
      }));
      
      setCustomers(formattedCustomers);
      setFilteredCustomers(formattedCustomers);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Gagal memuat data pelanggan");
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk pencarian pelanggan
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => 
      customer.name?.toLowerCase().includes(query) || 
      customer.address?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
    
    setFilteredCustomers(filtered);
  };

  // Handler untuk pencarian lokasi menggunakan Nominatim API
  const searchLocation = async () => {
    if (!locationSearch.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: locationSearch,
          format: 'json',
          limit: 5
        }
      });
      
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching location:", err);
      alert("Gagal mencari lokasi");
    } finally {
      setIsSearching(false);
    }
  };

  // Handler untuk memilih hasil pencarian lokasi
  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setSelectedCoordinates([lat, lon]);
    setFormData(prev => ({
      ...prev,
      address: result.display_name
    }));
    
    setSearchResults([]);
    setLocationSearch('');
    
    // Pindahkan peta ke lokasi yang dipilih
    if (window.map) {
      window.map.setView([lat, lon], 16);
      
      // Update marker jika sedang dalam mode form
      if (isFormOpen && window.draggableMarker) {
        window.draggableMarker.setLatLng([lat, lon]);
      }
    }
  };

  // Handler untuk menambah pelanggan baru
  const handleAddCustomer = async () => {
    // Validasi form
    if (!formData.customerId || !formData.address) {
      alert('Pelanggan dan alamat harus diisi');
      return;
    }

    try {
      // Implementasi API call untuk menambah/update lokasi pelanggan
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/addAlamat/${formData.customerId}`, {
        address: formData.address,
        latitude: selectedCoordinates[0],
        longitude: selectedCoordinates[1]
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh data pelanggan
      getCustomers();
      
      // Reset form
      setFormData({
        customerId: '',
        address: '',
        phone: '',
      });
      
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error adding customer location:", err);
      alert("Gagal menambahkan lokasi pelanggan");
    }
  };

  // Handler untuk menghapus pelanggan
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data lokasi pelanggan ini?')) {
      try {
        // Implementasi API call untuk menghapus lokasi pelanggan
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/delete-location/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Refresh data pelanggan
        getCustomers();
      } catch (err) {
        console.error("Error deleting customer location:", err);
        alert("Gagal menghapus lokasi pelanggan");
      }
    }
  };

  // Handler untuk perubahan input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hitung total pesanan dari semua pelanggan
  const totalOrders = filteredCustomers.reduce((sum, customer) => sum + (customer.total_order || 0), 0);
  const formatPhoneNumber = (phone) => {
    // Hapus karakter non-digit
    const cleanedPhone = phone.replace(/\D/g, '');
  
    // Jika nomor dimulai dengan "08", ubah menjadi format internasional "62"
    if (cleanedPhone.startsWith('08')) {
      return `62${cleanedPhone.slice(1)}`;
    }
  
    // Jika nomor sudah dimulai dengan "62", gunakan langsung
    if (cleanedPhone.startsWith('62')) {
      return cleanedPhone;
    }
  
    // Jika nomor dimulai dengan "021", tambahkan awalan "62"
    if (cleanedPhone.startsWith('021')) {
      return `62${cleanedPhone}`;
    }
  
    // Jika tidak sesuai dengan format di atas, kembalikan nomor asli
    return cleanedPhone;
  };
  // Load data pelanggan saat komponen dimount
  useEffect(() => {
    getCustomers();
  }, []);

  return (
    <div className="p-4 max-w-[100%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Peta Sebaran Pelanggan</h1>
      
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, alamat, atau telepon..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Kolom kiri: Form dan Statistik */}
        <div className="lg:col-span-1 space-y-4">
          {/* Form Tambah Pelanggan */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Update Lokasi Pelanggan</h2>
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
              >
                {isFormOpen ? 'Tutup Form' : '+ Update'}
              </button>
            </div>
            
            {isFormOpen && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pelanggan</label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">-- Pilih Pelanggan --</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} (Order: {customer.total_order || 0})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Pencarian Lokasi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cari Lokasi</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Cari alamat atau tempat..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={searchLocation}
                      disabled={isSearching}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200 disabled:bg-blue-300"
                    >
                      {isSearching ? 'Mencari...' : 'Cari'}
                    </button>
                  </div>
                  
                  {/* Hasil Pencarian */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map((result, index) => (
                          <li 
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleSelectLocation(result)}
                          >
                            {result.display_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Alamat Lengkap"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Geser marker pada peta atau gunakan pencarian untuk menentukan lokasi pelanggan
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Latitude:</span> {selectedCoordinates[0].toFixed(6)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Longitude:</span> {selectedCoordinates[1].toFixed(6)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAddCustomer}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-[100%] rounded-md text-sm transition-colors duration-200"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Statistik */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-blue-700">Total Pelanggan</h3>
              <p className="text-2xl font-bold text-blue-800">{filteredCustomers.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-green-700">Total Order</h3>
              <p className="text-2xl font-bold text-green-800">{totalOrders}</p>
            </div>
          </div>
        </div>
        
        {/* Kolom kanan: Peta */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-bold mb-2">Peta Lokasi</h2>
            {loading ? (
              <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p>Memuat peta...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-[400px] w-full flex items-center justify-center bg-red-50 rounded-lg">
                <div className="text-center text-red-500">
                  <p>{error}</p>
                  <button 
                    onClick={getCustomers}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <MapComponent 
                  customers={filteredCustomers} 
                  selectedCoordinates={selectedCoordinates}
                  setSelectedCoordinates={setSelectedCoordinates}
                  isFormOpen={isFormOpen}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabel Daftar Pelanggan */}
      <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Daftar Pelanggan</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Memuat data pelanggan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Koordinat
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Total Order
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md font-medium text-gray-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-md text-gray-900 max-w-xs truncate">
                        {customer.address || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md text-gray-900">
                        {customer.phone ? (
                          <a
                            href={`https://wa.me/${formatPhoneNumber(customer.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {customer.phone}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md text-gray-900">
                        {customer.latitude && customer.longitude ? 
                          `${parseFloat(customer.latitude).toFixed(6)}, ${parseFloat(customer.longitude).toFixed(6)}` : 
                          '-'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md font-medium text-gray-900">
                        {customer.total_order || 0}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-full transition-colors duration-200"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredCustomers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {searchQuery ? 'Tidak ada pelanggan yang sesuai dengan pencarian' : 'Belum ada data pelanggan'}
          </div>
        )}
      </div>
    </div>
  );
};

// Komponen Peta menggunakan Leaflet
const MapComponent = ({ customers, selectedCoordinates, setSelectedCoordinates, isFormOpen }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const draggableMarkerRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    // Fix Leaflet icon issues
    if (typeof window !== 'undefined') {
      delete L.Icon.Default.prototype._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }

    // Initialize map if it doesn't exist yet
    if (!mapRef.current && mapContainerRef.current) {
      // Create map instance - center on Indonesia
      mapRef.current = L.map(mapContainerRef.current).setView([-6.2, 106.8], 5);
      
      // Store map reference in window for access from outside component
      window.map = mapRef.current;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add click handler to map
      mapRef.current.on('click', (e) => {
        if (isFormOpen) {
          setSelectedCoordinates([e.latlng.lat, e.latlng.lng]);
        }
      });
    }

    // Add markers for customers
    const map = mapRef.current;
    if (map) {
      // Clear existing markers (except draggable marker)
      Object.values(markersRef.current).forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = {};

      // Add markers for each customer
      customers.forEach((customer) => {
        if (customer.latitude && customer.longitude) {
          const lat = parseFloat(customer.latitude);
          const lng = parseFloat(customer.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]).addTo(map);
            
            // Add popup with customer info
            marker.bindPopup(`
              <strong>${customer.name}</strong><br>
              ${customer.address || ''}<br>
              ${customer.phone || ''}<br>
              <strong>Total Order:</strong> ${customer.total_order || 0}
            `);
            
            // Store marker reference
            markersRef.current[customer.id] = marker;
          }
        }
      });

      // Add or update draggable marker if form is open
      if (isFormOpen) {
        if (draggableMarkerRef.current) {
          draggableMarkerRef.current.setLatLng(selectedCoordinates);
        } else {
          // Create draggable marker with custom icon
          const redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          draggableMarkerRef.current = L.marker(selectedCoordinates, {
            draggable: true,
            icon: redIcon
          }).addTo(map);
          
          // Store draggable marker reference in window for access from outside component
          window.draggableMarker = draggableMarkerRef.current;
          
          draggableMarkerRef.current.bindPopup('Geser marker untuk memilih lokasi').openPopup();
          
          // Update coordinates when marker is dragged
          draggableMarkerRef.current.on('dragend', (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setSelectedCoordinates([position.lat, position.lng]);
          });
        }
      } else if (draggableMarkerRef.current) {
        map.removeLayer(draggableMarkerRef.current);
        draggableMarkerRef.current = null;
        window.draggableMarker = null;
      }

      // Adjust map view to fit all markers if there are customers with valid coordinates
      const validCustomers = customers.filter(c => 
        c.latitude && c.longitude && 
        !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude))
      );
      
      if (validCustomers.length > 0) {
        const bounds = validCustomers.map(c => 
          L.latLng(parseFloat(c.latitude), parseFloat(c.longitude))
        );
        
        if (bounds.length > 0) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current && draggableMarkerRef.current) {
        mapRef.current.removeLayer(draggableMarkerRef.current);
      }
    };
  }, [customers, selectedCoordinates, setSelectedCoordinates, isFormOpen]);

  // Handle window resize to make map responsive
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default CustomerDistribution;