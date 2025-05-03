import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePakaian } from '../context/PakaianContext';

const TabelPakaian = () => {
  const navigate = useNavigate();
  const { pakaianList, deletePakaian, setEditingPakaian } = usePakaian();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deletePakaian(id);
    }
  };

  const handleEdit = (pakaian) => {
    setEditingPakaian(pakaian);
    navigate('/pakaian/tambah');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Tabel Pakaian</h2>
      
      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4">
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
        
        <div className="flex items-center space-x-2">
          <span>Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Pakaian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ukuran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gambar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pakaianList
              .filter(item => 
                item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.nama}</td>
                  <td className="px-6 py-4">{item.deskripsi}</td>
                  <td className="px-6 py-4">{item.warna.join(', ')}</td>
                  <td className="px-6 py-4">{item.ukuran.join(', ')}</td>
                  <td className="px-6 py-4">Rp {parseInt(item.harga).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {item.gambar && (
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
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
          Showing 1 to {Math.min(entriesPerPage, pakaianList.length)} of {pakaianList.length} entries
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

export default TabelPakaian; 