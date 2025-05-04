import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePakaian } from '../context/PakaianContext';

const TambahPakaian = () => {
  const navigate = useNavigate();
  const { addPakaian, editingPakaian, updatePakaian, setEditingPakaian } = usePakaian();
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    warna: [],
    ukuran: [],
    harga: '',
    gambar: null
  });

  // Mengisi form dengan data yang akan diedit
  useEffect(() => {
    if (editingPakaian) {
      setFormData(editingPakaian);
    }
  }, [editingPakaian]);

  const warnaOptions = [
    'Hitam', 'Putih', 'Abu-Abu', 'Merah', 'Orange', 
    'Kuning', 'Hijau', 'Biru', 'Ungu'
  ];

  const ukuranOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [type]: checked 
        ? [...prev[type], value]
        : prev[type].filter(item => item !== value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          gambar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPakaian) {
      updatePakaian(editingPakaian.id, formData);
      setEditingPakaian(null);
    } else {
      addPakaian(formData);
    }

    // Reset form
    setFormData({
      nama: '',
      deskripsi: '',
      warna: [],
      ukuran: [],
      harga: '',
      gambar: null
    });

    // Redirect ke tabel pakaian
    navigate('/pakaian/tabel');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {editingPakaian ? 'Edit Pakaian' : 'Tambah Pakaian'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Pakaian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            placeholder="Contoh: Kemeja Formal"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleInputChange}
            placeholder="Deskripsi produk"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
          />
        </div>

        {/* Warna */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warna Tersedia
          </label>
          <div className="grid grid-cols-3 gap-4">
            {warnaOptions.map(warna => (
              <label key={warna} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={warna}
                  checked={formData.warna.includes(warna)}
                  onChange={(e) => handleCheckboxChange(e, 'warna')}
                  className="rounded border-gray-300 text-brown-600 focus:ring-brown-500"
                />
                <span>{warna}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ukuran */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ukuran Tersedia
          </label>
          <div className="flex space-x-4">
            {ukuranOptions.map(ukuran => (
              <label key={ukuran} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={ukuran}
                  checked={formData.ukuran.includes(ukuran)}
                  onChange={(e) => handleCheckboxChange(e, 'ukuran')}
                  className="rounded border-gray-300 text-brown-600 focus:ring-brown-500"
                />
                <span>{ukuran}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga
          </label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleInputChange}
            placeholder="Contoh: 75000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
          />
        </div>

        {/* Upload Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unggah Gambar Produk
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {formData.gambar && (
            <img
              src={formData.gambar}
              alt="Preview"
              className="mt-2 h-32 w-32 object-cover rounded"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahPakaian; 