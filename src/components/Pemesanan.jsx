import { useEffect, useState } from 'react';
import { usePakaian } from '../context/PakaianContext';
import { useBahan } from '../context/BahanContext';
import { usePemesanan } from '../context/PemesananContext';
import TambahPesananModal from './TambahPesananModal';
import axios from 'axios';

const Pemesanan = () => {
  const { pakaianList } = usePakaian();
  const { bahanList } = useBahan();
  const { pesananList, updatePesanan, deletePesanan, setPesananList } = usePemesanan();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [order, setOrder] = useState([]);

  const handleStatusChange = (id, newStatus) => {
    updatePesanan(id, { status: newStatus });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'proses':
        return 'bg-blue-100 text-blue-800';
      case 'terima':
        return 'bg-green-100 text-green-800';
      case 'tolak':
        return 'bg-red-100 text-red-800';
      case 'selesai':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const formatCurrency = (amount) => {
    return amount ? `Rp ${amount.toLocaleString()}` : 'Rp 0';
  };

  const handleAddPesanan = (newPesanan) => {
    setPesananList(prev => [...prev, { ...newPesanan, id: Date.now() }]);
  };

  const ambildata = async() => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/custom`,{
      headers: {
        'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("token")}`

      }
    });
    console.log("data order",response.data.data)
    setOrder(response.data.data)
  } 
  useEffect(() =>{
    ambildata()
  },[])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Pemesanan</h2>
        <button
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
          onClick={() => setIsModalOpen(true)}
        >
          Tambah Pesanan
        </button>
      </div>

      {/* Modal */}
      <TambahPesananModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPesanan}
      />

      {/* Filter dan Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div>
          <select
            className="w-full border border-gray-300 rounded px-3 py-1"
            onChange={(e) => {/* Filter by status */}}
          >
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="proses">Proses</option>
            <option value="terima">Terima</option>
            <option value="tolak">Tolak</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-1"
            onChange={(e) => {/* Filter by date */}}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Pakaian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bahan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ukuran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referensi Foto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catatan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order?.map((pesanan) => (
                <tr key={pesanan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pesanan.created_at ? new Date(pesanan.created_at).toLocaleDateString() : '-'}
                  </td>
                  {/* Untuk muthia */}
                  <td className="px-6 py-4">{pesanan.jenis_baju || '-'}</td>
                  <td className="px-6 py-4">{pesanan.detail_bahan || '-'}</td>
                  <td className="px-6 py-4">{pesanan.ukuran || '-'}</td>
                  <td className="px-6 py-4">{pesanan.jumlah || 0}</td>
                  <td className="px-6 py-4">
                    {pesanan.gambar_referensi && (
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${pesanan.gambar_referensi || '-'}`}
                        alt="Referensi"
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">{pesanan.catatan || '-'}</td>
                  <td className="px-6 py-4">{formatCurrency(pesanan.total_harga)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(pesanan.status)}`}>
                      {pesanan.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(pesanan.id, 'Terima')}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => handleStatusChange(pesanan.id, 'Tolak')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => {/* View detail */}}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Showing 1 to {Math.min(entriesPerPage, pesananList.length)} of {pesananList.length} entries
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-brown-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pemesanan; 