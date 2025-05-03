import React, { useState } from 'react';
import { usePesanan } from '../context/PesananContext';
import { usePakaian } from '../context/PakaianContext';
import { useBahan } from '../context/BahanContext';

const TambahPesananModal = ({ isOpen, onClose, onSuccess }) => {
  const { addPesanan } = usePesanan();
  const { pakaianList } = usePakaian();
  const { bahanList } = useBahan();

  const [formData, setFormData] = useState({
    namaPemesan: '',
    nomorHP: '',
    alamat: '',
    jenisPakaian: '',
    bahan: '',
    warna: '',
    ukuran: '',
    jumlah: '',
    totalHarga: '',
    catatan: '',
    referensiFoto: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          referensiFoto: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Log untuk debugging
      console.log('Form data before submit:', formData);

      // Buat objek pesanan baru
      const newPesanan = {
        ...formData,
        id: Date.now(),
        status: 'Pending',
        tanggalPesan: new Date().toISOString(),
        jumlah: parseInt(formData.jumlah),
        totalHarga: parseInt(formData.totalHarga)
      };

      // Log untuk debugging
      console.log('New pesanan object:', newPesanan);

      // Tambahkan pesanan
      await addPesanan(newPesanan);

      // Log untuk debugging
      console.log('Pesanan added successfully');

      // Reset form
      setFormData({
        namaPemesan: '',
        nomorHP: '',
        alamat: '',
        jenisPakaian: '',
        bahan: '',
        warna: '',
        ukuran: '',
        jumlah: '',
        totalHarga: '',
        catatan: '',
        referensiFoto: null
      });

      // Tutup modal
      onClose();
      onSuccess && onSuccess();

    } catch (error) {
      console.error('Error adding pesanan:', error);
      alert('Terjadi kesalahan saat menambahkan pesanan');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tambah Pesanan Baru</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama dan Nomor HP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pemesan
              </label>
              <input
                type="text"
                name="namaPemesan"
                value={formData.namaPemesan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor HP
              </label>
              <input
                type="tel"
                name="nomorHP"
                value={formData.nomorHP}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Jenis Pakaian dan Bahan - Diubah menjadi input text */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Pakaian
              </label>
              <input
                type="text"
                name="jenisPakaian"
                value={formData.jenisPakaian}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Masukkan jenis pakaian"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bahan
              </label>
              <input
                type="text"
                name="bahan"
                value={formData.bahan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Masukkan jenis bahan"
                required
              />
            </div>
          </div>

          {/* Warna dan Ukuran */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warna
              </label>
              <input
                type="text"
                name="warna"
                value={formData.warna}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ukuran
              </label>
              <select
                name="ukuran"
                value={formData.ukuran}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Pilih Ukuran</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          </div>

          {/* Jumlah dan Total Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Harga
              </label>
              <input
                type="number"
                name="totalHarga"
                value={formData.totalHarga}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              name="catatan"
              value={formData.catatan}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Referensi Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referensi Foto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {formData.referensiFoto && (
              <img
                src={formData.referensiFoto}
                alt="Preview"
                className="mt-2 h-32 w-32 object-cover rounded"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPesananModal; 