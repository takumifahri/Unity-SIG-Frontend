import React, { useState } from 'react';
import Map from './map';
import AddCustomerForm from './AddCustomerForm';
import '../styles/map.css';

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Peta Sebaran Pelanggan</h1>
      
      {/* Form Tambah Pelanggan */}
      <AddCustomerForm onAddCustomer={handleAddCustomer} />
      
      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700">Total Pelanggan</h3>
          <p className="text-2xl font-bold text-blue-800">{customers.length}</p>
        </div>
      </div>

      {/* Peta */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="map-container">
          <div id="map"></div>
          <Map customers={customers} />
        </div>
      </div>

      {/* Tabel Daftar Pelanggan */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4">Daftar Pelanggan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
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
                <tr key={customer.id}>
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
                      {customer.coordinates[0]}, {customer.coordinates[1]}
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
        </div>
        
        {customers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Belum ada data pelanggan
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDistribution; 