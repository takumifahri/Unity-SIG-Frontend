import React, { useState } from 'react';

const AddCustomerForm = ({ onAddCustomer }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!formData.name || !formData.address || !formData.phone || !formData.latitude || !formData.longitude) {
      alert('Semua field harus diisi!');
      return;
    }

    // Konversi latitude & longitude ke number
    const newCustomer = {
      id: Date.now(), // temporary ID
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      coordinates: [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    };

    onAddCustomer(newCustomer);

    // Reset form
    setFormData({
      name: '',
      address: '',
      phone: '',
      latitude: '',
      longitude: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Tambah Pelanggan Baru</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nama Pelanggan
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Nama Pelanggan"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nomor Telepon
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Nomor Telepon"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Alamat
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Alamat Lengkap"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contoh: -7.2575"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contoh: 112.7521"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Tambah Pelanggan
        </button>
      </div>
    </form>
  );
};

export default AddCustomerForm;