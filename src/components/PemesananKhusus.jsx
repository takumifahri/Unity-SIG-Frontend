import { useEffect, useState } from 'react';
import { usePakaian } from '../context/PakaianContext';
import { useBahan } from '../context/BahanContext';
import { usePemesanan } from '../context/PemesananContext';
import TambahPesananModal from './TambahPesananModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PemesananKhusus = () => {
  const { pakaianList } = usePakaian();
  const { bahanList } = useBahan();
  const { pesananList, updatePesanan, deletePesanan, setPesananList } = usePemesanan();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [order, setOrder] = useState([]);
  const [custom, setCustom] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [catalog, setcatalog] = useState([]);
  const handleStatusChange = (id, newStatus) => {
    updatePesanan(id, { status: newStatus });
  };
  const navigate = useNavigate();
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'Menunggu_Pembayaran':
        return 'yellow-50'; // Latar belakang kuning muda
      case 'Menunggu_Konfirmasi':
        return 'blue-50'; // Latar belakang biru muda
      case 'Diproses':
        return 'green-50'; // Latar belakang hijau muda
      case 'Sedang_Dikirim':
        return 'purple-50'; // Latar belakang ungu muda
      case 'Sudah_Terkirim':
        return 'teal-50'; // Latar belakang teal muda
      case 'Selesai':
        return 'purple-50'; // Latar belakang hijau tua
      default:
        return 'gray-50'; // Latar belakang abu-abu muda
    }
  };


  const formatCurrency = (amount) => {
    return amount ? `Rp ${amount.toLocaleString()}` : 'Rp 0';
  };

  const handleAddPesanan = (newPesanan) => {
    setPesananList(prev => [...prev, { ...newPesanan, id: Date.now() }]);
  };


//   const ambildata = async() => {
//     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order`,{
//       headers: {
//         'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${localStorage.getItem("token")}`

//       }
//     });
//     console.log("data order",response.data.data)
//     setOrder(response.data.data )
//     setCustom(response.data.data.custom_orders)
//     setTransaction(response.data.data.transaction)  
//     setcatalog(response.data.data.catalog)
//     // setApproved(response.data.data.custom_orders.approved_by_user)   
//   } 

    const proposeOrder = async() =>{
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/custom`, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
            });
            console.log("data order", response.data.data);
            setOrder(response.data.data);
            setCustom(response.data.data.custom_orders);
            setTransaction(response.data.data.transaction);
            setcatalog(response.data.data.catalog);
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
    }
    const handleDetail = (id) => {
        // Navigasi ke halaman detail pesanan
        navigate(`/pesanan/${id}`);
    };
    useEffect(() =>{
        proposeOrder()
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
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Jenis Pemesanan
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Jenis Pakaian
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Bahan
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Ukuran
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Referensi Foto
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Catatan
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Total Harga
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pesanan.catalog_id === null
                      ? 'Pemesanan Khusus'
                      : pesanan.custom_order_id === null
                      ? 'Pemesanan Jadi'
                      : '-'}
                  </td>
                  {/* Untuk muthia */}
                  <td className="px-6 py-4">{pesanan.custom_order?.jenis_baju || pesanan.catalog?.nama_katalog ||'-'}</td>
                  <td className="px-6 py-4">{pesanan.custom_order?.detail_bahan || pesanan.catalog?.bahan  || '-'}</td>
                  <td className="px-6 py-4">{pesanan.custom_order?.ukuran || pesanan.catalog?.nama_katalog  || '-'}</td>
                  <td className="px-6 py-4">{pesanan.custom_order?.jumlah || 0}</td>
                  <td className="px-6 py-4">
                    {pesanan.custom_order?.gambar_referensi && (
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${pesanan.custom_order?.gambar_referensi || pesanan.catalog?.nama_katalog  || '-'}`}
                        alt="Referensi"
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">{pesanan.custom_order?.catatan || pesanan.catalog?.nama_katalog  || '-'}</td>
                  <td className="px-6 py-4">{formatCurrency(pesanan.total_harga)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-md bg-${getStatusBadgeColor(pesanan.status)}`}>
                      {pesanan.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                    {pesanan.status === 'pending' && (
                      <>
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
                          onClick={() => handleDetail(pesanan.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Detail
                        </button>
                      </>
                    )}
                    {pesanan.status === 'Selesai' && (
                      <button
                        onClick={() => handleDetail(pesanan.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Detail
                      </button>
                    )}
                    {pesanan.status === 'Diterima' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(pesanan.id, 'Finalisasi')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                          Finalisasi
                        </button>
                        <button
                          onClick={() => handleStatusChange(pesanan.id, 'Dibatalkan')}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Dibatalkan
                        </button>
                        <button
                          onClick={() => handleDetail(pesanan.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Detail
                        </button>
                      </>
                    )}
                    {pesanan.status === 'proses' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(pesanan.id, 'Delivery')}
                          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                        >
                          Delivery
                        </button>
                        <button
                          onClick={() => handleDetail(pesanan.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Detail
                        </button>
                      </>
                    )}
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

export default PemesananKhusus; 