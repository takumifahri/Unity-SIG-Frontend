import React, { useState, useEffect } from 'react';
import { usePesanan } from '../context/PesananContext';
import TambahPesananModal from './TambahPesananModal';

const AdminPesanan = () => {
  const { pesananList, updateStatus } = usePesanan();
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [filteredPesanan, setFilteredPesanan] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Pastikan pesananList adalah array
    const pesananArray = Array.isArray(pesananList) ? pesananList : [];
    console.log('PesananList in effect:', pesananArray);

    const filtered = selectedStatus === 'Semua' 
      ? pesananArray 
      : pesananArray.filter(pesanan => pesanan.status === selectedStatus);
    
    console.log('Filtered pesanan:', filtered);
    setFilteredPesanan(filtered);
  }, [selectedStatus, pesananList]);

  const handleStatusChange = (id, newStatus) => {
    updateStatus(id, newStatus);
    setSelectedStatus(newStatus);
  };

  const handleShowDetail = (pesanan) => {
    setSelectedPesanan(pesanan);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStatus('Pending');
  };

  const DetailModal = () => {
    if (!showDetailModal || !selectedPesanan) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Detail Pesanan</h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Nama Pemesan:</p>
                <p>{selectedPesanan.namaPemesan}</p>
              </div>
              <div>
                <p className="font-semibold">Nomor HP:</p>
                <p>{selectedPesanan.nomorHP}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Alamat:</p>
              <p>{selectedPesanan.alamat}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Jenis Pakaian:</p>
                <p>{selectedPesanan.jenisPakaian}</p>
              </div>
              <div>
                <p className="font-semibold">Bahan:</p>
                <p>{selectedPesanan.bahan}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Warna:</p>
                <p>{selectedPesanan.warna}</p>
              </div>
              <div>
                <p className="font-semibold">Ukuran:</p>
                <p>{selectedPesanan.ukuran}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Jumlah:</p>
                <p>{selectedPesanan.jumlah}</p>
              </div>
              <div>
                <p className="font-semibold">Total Harga:</p>
                <p>Rp {selectedPesanan.totalHarga.toLocaleString()}</p>
              </div>
            </div>

            {selectedPesanan.catatanTambahan && (
              <div>
                <p className="font-semibold">Catatan Tambahan:</p>
                <p>{selectedPesanan.catatanTambahan}</p>
              </div>
            )}

            {selectedPesanan.referensiFoto && (
              <div>
                <p className="font-semibold">Referensi Foto:</p>
                <img
                  src={selectedPesanan.referensiFoto}
                  alt="Referensi"
                  className="mt-2 max-h-48 object-contain"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Debug info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>Total Pesanan: {pesananList.length}</p>
        <p>Status Terpilih: {selectedStatus}</p>
        <p>Pesanan Terfilter: {filteredPesanan.length}</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manajemen Pesanan</h2>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
          >
            Tambah Pesanan
          </button>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="Semua">Semua Pesanan</option>
            <option value="Pending">Pending</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Tanggal</th>
              <th className="px-6 py-3 text-left">Jenis Pakaian</th>
              <th className="px-6 py-3 text-left">Bahan</th>
              <th className="px-6 py-3 text-left">Warna</th>
              <th className="px-6 py-3 text-left">Ukuran</th>
              <th className="px-6 py-3 text-left">Jumlah</th>
              <th className="px-6 py-3 text-left">Referensi Foto</th>
              <th className="px-6 py-3 text-left">Catatan</th>
              <th className="px-6 py-3 text-left">Total Harga</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPesanan.length > 0 ? (
              filteredPesanan.map((pesanan, index) => (
                <tr key={pesanan.id || index}>
                  <td className="px-6 py-4">
                    {new Date(pesanan.tanggalPesan).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{pesanan.jenisPakaian}</td>
                  <td className="px-6 py-4">{pesanan.bahan}</td>
                  <td className="px-6 py-4">{pesanan.warna}</td>
                  <td className="px-6 py-4">{pesanan.ukuran}</td>
                  <td className="px-6 py-4">{pesanan.jumlah}</td>
                  <td className="px-6 py-4">
                    {pesanan.referensiFoto && (
                      <img 
                        src={pesanan.referensiFoto} 
                        alt="Referensi" 
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">{pesanan.catatan}</td>
                  <td className="px-6 py-4">
                    Rp {parseInt(pesanan.totalHarga).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        pesanan.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : pesanan.status === 'Diproses'
                          ? 'bg-blue-100 text-blue-800'
                          : pesanan.status === 'Selesai'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pesanan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {pesanan.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(pesanan.id, 'Diproses')}
                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => handleStatusChange(pesanan.id, 'Ditolak')}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      {pesanan.status === 'Diproses' && (
                        <button
                          onClick={() => handleStatusChange(pesanan.id, 'Selesai')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Selesai
                        </button>
                      )}
                      <button
                        onClick={() => handleShowDetail(pesanan)}
                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada pesanan yang ditampilkan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Show
          <select className="mx-2 px-2 py-1 border rounded">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          entries
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded">Previous</button>
          <button className="px-3 py-1 bg-brown-600 text-white rounded">1</button>
          <button className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPesanan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <DetailModal />
        </div>
      )}

      <TambahPesananModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default AdminPesanan; 