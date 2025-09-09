import React, { useState } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';

const PesananCustom = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      tanggal: '2024-04-29',
      customer: 'Jane Smith',
      jenisPakaian: 'Kemeja',
      desainFile: 'design-1.pdf',
      jenisBahan: 'Cotton Combed 24s',
      ukuran: 'L',
      jumlah: 20,
      total: 2000000,
      status: 'Pending',
      alamat: 'Jl. Merdeka No. 45, Bandung',
      telepon: '08234567890',
      email: 'jane@example.com',
      catatan: 'Tolong tambahkan bordir logo di bagian dada kiri',
      spesifikasiDesain: 'Warna dasar putih, logo full color, lengan panjang'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Handle delete order
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  // Handle view detail
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Detail Modal
  const DetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detail Pesanan Custom #{selectedOrder.id.toString().padStart(5, '0')}</h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <MdClose size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informasi Pelanggan</h3>
              <p><span className="font-medium">Nama:</span> {selectedOrder.customer}</p>
              <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
              <p><span className="font-medium">Telepon:</span> {selectedOrder.telepon}</p>
              <p><span className="font-medium">Alamat:</span> {selectedOrder.alamat}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Informasi Pesanan</h3>
              <p><span className="font-medium">Jenis Pakaian:</span> {selectedOrder.jenisPakaian}</p>
              <p><span className="font-medium">Jenis Bahan:</span> {selectedOrder.jenisBahan}</p>
              <p><span className="font-medium">Ukuran:</span> {selectedOrder.ukuran}</p>
              <p><span className="font-medium">Jumlah:</span> {selectedOrder.jumlah}</p>
              <p><span className="font-medium">Total:</span> Rp {selectedOrder.total.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Spesifikasi Desain</h3>
            <p className="mb-2">{selectedOrder.spesifikasiDesain}</p>
            <p><span className="font-medium">File Desain:</span> {selectedOrder.desainFile}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Catatan Tambahan</h3>
            <p>{selectedOrder.catatan}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Status Pesanan</h3>
            <select
              value={selectedOrder.status}
              onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
            >
              <option value="Pending">Pending</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                handleDeleteOrder(selectedOrder.id);
                setShowDetailModal(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Hapus Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pesanan Custom</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pesanan..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
            />
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500">
            <option value="">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pesanan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Pakaian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Bahan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  #{order.id.toString().padStart(5, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.tanggal).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.customer}
                </td>
                <td className="px-6 py-4">
                  {order.jenisPakaian}
                </td>
                <td className="px-6 py-4">
                  {order.jenisBahan}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.jumlah}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {order.total.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewDetail(order)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Detail
                  </button>
                  <button 
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">20</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {showDetailModal && <DetailModal />}
    </div>
  );
};

export default PesananCustom; 