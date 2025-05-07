import React, { useState } from 'react';
import Map from './map';
import AddCustomerForm from './AddCustomerForm';
import '../styles/map.css';
import 'leaflet/dist/leaflet.css';
import { MdPeople, MdLocationOn, MdBusiness } from 'react-icons/md';

const CustomerDistribution = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'PT. Surya Abadi',
      address: 'Jl. Raya Darmo No. 123, Surabaya',
      phone: '031-1234567',
      coordinates: [-7.2575, 112.7521]
    }
  ]);

  const handleAddCustomer = (newCustomer) => {
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    }
  };

  // Menghitung statistik
  const totalCustomers = customers.length;
  const businessCustomers = customers.filter(c => c.name.toLowerCase().includes('pt')).length;
  const individualCustomers = totalCustomers - businessCustomers;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Peta Sebaran Pelanggan</h1>
        <button
          onClick={() => document.getElementById('addCustomerForm').scrollIntoView({ behavior: 'smooth' })}
          className="bg-brown-600 hover:bg-brown-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Tambah Pelanggan
        </button>
      </div>
      
      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <MdPeople className="text-4xl text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Total Pelanggan</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalCustomers}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <MdBusiness className="text-4xl text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Pelanggan Bisnis</p>
              <h3 className="text-2xl font-bold text-gray-800">{businessCustomers}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center">
            <MdLocationOn className="text-4xl text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Pelanggan Individual</p>
              <h3 className="text-2xl font-bold text-gray-800">{individualCustomers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Peta */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Visualisasi Peta</h2>
        <div className="map-container">
          <Map customers={customers} />
        </div>
      </div>

      {/* Form Tambah Pelanggan */}
      <div id="addCustomerForm">
        <AddCustomerForm onAddCustomer={handleAddCustomer} />
      </div>

      {/* Tabel Daftar Pelanggan */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Daftar Pelanggan</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari pelanggan..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telepon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koordinat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {customer.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.coordinates[0].toFixed(4)}, {customer.coordinates[1].toFixed(4)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors duration-200"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {customers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MdPeople className="mx-auto text-4xl mb-2" />
              <p>Belum ada data pelanggan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDistribution; 