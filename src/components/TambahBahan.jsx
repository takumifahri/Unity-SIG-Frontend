import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBahan } from '../context/BahanContext';

const TambahBahan = () => {
  const navigate = useNavigate();
  const { addBahan, editingBahan, updateBahan, setEditingBahan } = useBahan();
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    warna: [],
    harga: '',
    gambar: null
  });

  // Mengisi form dengan data yang akan diedit
  useEffect(() => {
    if (editingBahan) {
      setFormData(editingBahan);
    }
  }, [editingBahan]);

  const warnaOptions = [
    'Hitam', 'Putih', 'Abu-Abu', 'Merah', 'Orange', 
    'Kuning', 'Hijau', 'Biru', 'Ungu'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      warna: checked 
        ? [...prev.warna, value]
        : prev.warna.filter(item => item !== value)
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
    if (editingBahan) {
      updateBahan(editingBahan.id, formData);
      setEditingBahan(null);
    } else {
      addBahan(formData);
    }

    // Reset form
    setFormData({
      nama: '',
      deskripsi: '',
      warna: [],
      harga: '',
      gambar: null
    });

    // Redirect ke tabel bahan
    navigate('/bahan/tabel');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {editingBahan ? 'Edit Bahan' : 'Tambah Bahan'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Bahan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Bahan
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            placeholder="Contoh: Kain Satin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          ></textarea>
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
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-brown-600 focus:ring-brown-500"
                />
                <span>{warna}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga Permeter
          </label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleInputChange}
            placeholder="Contoh: 75000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            min="0"
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

        {/* Tombol Submit dan Cancel */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                nama: '',
                deskripsi: '',
                warna: [],
                harga: '',
                gambar: null
              });
              setEditingBahan(null);
              navigate('/bahan/tabel');
            }}
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

export default TambahBahan; 