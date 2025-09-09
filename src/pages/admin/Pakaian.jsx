import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const Pakaian = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pakaian, setPakaian] = useState([
    {
      id: 1,
      nama: 'Kaos Polos',
      kategori: 'Kaos',
      harga: 85000,
      deskripsi: 'Kaos polos berbahan cotton combed 30s',
      stok: 50,
      ukuran: ['S', 'M', 'L', 'XL'],
      warna: ['Hitam', 'Putih', 'Navy'],
      gambar: 'kaos-polos.jpg'
    }
  ]);

  const [formData, setFormData] = useState({
    nama: '',
    kategori: '',
    harga: '',
    deskripsi: '',
    stok: '',
    ukuran: [],
    warna: [],
    gambar: null
  });

  // Handle edit button click
  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga,
      deskripsi: item.deskripsi,
      stok: item.stok,
      ukuran: item.ukuran,
      warna: item.warna,
      gambar: item.gambar
    });
    setShowForm(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle multiple select for sizes
  const handleUkuranChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      ukuran: selectedOptions
    }));
  };

  // Handle multiple select for colors
  const handleWarnaChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      warna: selectedOptions
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      gambar: file
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: '',
      kategori: '',
      harga: '',
      deskripsi: '',
      stok: '',
      ukuran: [],
      warna: [],
      gambar: null
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing pakaian
      setPakaian(pakaian.map(item => 
        item.id === editingId ? {
          ...item,
          ...formData,
          harga: parseFloat(formData.harga),
          stok: parseInt(formData.stok)
        } : item
      ));
    } else {
      // Add new pakaian
      const newPakaian = {
        id: pakaian.length + 1,
        ...formData,
        harga: parseFloat(formData.harga),
        stok: parseInt(formData.stok)
      };
      setPakaian([...pakaian, newPakaian]);
    }
    
    resetForm();
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pakaian ini?')) {
      setPakaian(pakaian.filter(item => item.id !== id));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pakaian</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#5D4037] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#4E342E]"
          >
            <MdAdd size={20} />
            <span>Tambah Pakaian</span>
          </button>
        )}
      </div>

      {/* Form Tambah/Edit Pakaian */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Pakaian' : 'Tambah Pakaian Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pakaian
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Kaos">Kaos</option>
                  <option value="Kemeja">Kemeja</option>
                  <option value="Jaket">Jaket</option>
                  <option value="Celana">Celana</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ukuran
                </label>
                <select
                  multiple
                  name="ukuran"
                  value={formData.ukuran}
                  onChange={handleUkuranChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Tekan Ctrl untuk memilih beberapa ukuran</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warna
                </label>
                <select
                  multiple
                  name="warna"
                  value={formData.warna}
                  onChange={handleWarnaChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                >
                  <option value="Hitam">Hitam</option>
                  <option value="Putih">Putih</option>
                  <option value="Navy">Navy</option>
                  <option value="Merah">Merah</option>
                  <option value="Abu-abu">Abu-abu</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Tekan Ctrl untuk memilih beberapa warna</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar
                </label>
                <input
                  type="file"
                  name="gambar"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Biarkan kosong jika tidak ingin mengubah gambar
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#5D4037] text-white rounded-lg hover:bg-[#4E342E]"
              >
                {isEditing ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Pakaian */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Pakaian</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari pakaian..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gambar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ukuran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pakaian.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.kategori}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {item.harga.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.stok}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.ukuran.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.warna.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pakaian; 