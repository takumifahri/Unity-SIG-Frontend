import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { usePakaian } from '../context/PakaianContext';

const TabelPakaian = () => {
  const navigate = useNavigate();
  const { 
    catalogList, 
    loading, 
    error, 
    fetchCatalogs, 
    deleteCatalog, 
    deleteCatalogWithReason,
    restoreCatalog,
    setEditingCatalog,
    addStock
  } = usePakaian();
  // Helper function untuk mendapatkan URL gambar pertama
  const getImageUrl = (gambar) => {
    if (!gambar) return '';
    
    // Jika gambar adalah array, ambil yang pertama
    if (Array.isArray(gambar)) {
      return gambar.length > 0 
        ? `${process.env.REACT_APP_API_URL}/${gambar[0]}`
        : '';
    }
    
    // Jika gambar adalah string (untuk backward compatibility)
    return `${process.env.REACT_APP_API_URL}/${gambar}`;
  };
  
  // State lainnya...
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [filterType, setFilterType] = useState('');
  
  // State untuk modal penambahan stok
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockAmount, setStockAmount] = useState(1);
  const [selectedCatalogName, setSelectedCatalogName] = useState('');

  // Fetch catalogs on component mount or when filter changes
  useEffect(() => {
    fetchCatalogs({ master_jenis_id: filterType, search: searchTerm });
  }, [filterType]);

  const handleDelete = (id) => {
    setSelectedCatalogId(id);
    setShowDeleteModal(true);
  };

  // Handler untuk menampilkan modal penambahan stok
  const handleShowAddStockModal = (catalog) => {
    setSelectedCatalogId(catalog.id);
    setSelectedCatalogName(catalog.nama_katalog);
    setStockAmount(1); // Reset jumlah stok
    setShowAddStockModal(true);
  };

  // Handler untuk mengonfirmasi penambahan stok
  const confirmAddStock = async () => {
    try {
      await addStock(selectedCatalogId, stockAmount);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Stok produk ${selectedCatalogName} berhasil ditambahkan sebanyak ${stockAmount} unit`
      });
      
      setShowAddStockModal(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menambahkan stok produk'
      });
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteReason.trim()) {
        await deleteCatalogWithReason(selectedCatalogId, deleteReason);
      } else {
        await deleteCatalog(selectedCatalogId);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Produk berhasil dihapus'
      });
      
      setShowDeleteModal(false);
      setDeleteReason('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menghapus produk'
      });
    }
  };

  
  const handleEdit = (catalog) => {
    setEditingCatalog(catalog);
    navigate('/admin/catalog/edit');
  };

  const handleSearch = () => {
    fetchCatalogs({ master_jenis_id: filterType, search: searchTerm });
  };

  const handleRestore = async (id) => {
    try {
      await restoreCatalog(id);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Produk berhasil dipulihkan'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memulihkan produk'
      });
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const filteredCatalogs = catalogList;
  const currentCatalogs = filteredCatalogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCatalogs.length / entriesPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Katalog Produk</h2>
      
      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <div className="flex items-center space-x-2 mb-2">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing entries per page
            }}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>
        
        <div className='flex gap-10'>
          <div className="flex items-center space-x-2 mb-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Semua Kategori</option>
              <option value="1">Kemeja</option>
              <option value="2">Kaos</option>
              <option value="3">Jaket</option>
              <option value="4">Celana</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama/deskripsi..."
              className="border border-gray-300 rounded px-3 py-1"
            />
            <button 
              onClick={handleSearch}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cari
            </button>
          </div>

          <button
            onClick={() => {
              setEditingCatalog(null);
              navigate('/admin/catalog/add');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Tambah Katalog
          </button>
        </div>
        
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data katalog...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bahan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
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
                {currentCatalogs.length > 0 ? (
                  currentCatalogs.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.nama_katalog}</td>
                      <td className="px-6 py-4">
                        {item.deskripsi && item.deskripsi.length > 50 
                          ? `${item.deskripsi.substring(0, 50)}...` 
                          : item.deskripsi}
                      </td>
                      <td className="px-6 py-4">{item.bahan}</td>
                      <td className="px-6 py-4">{item.stok}</td>
                      <td className="px-6 py-4">Rp {parseInt(item.price).toLocaleString()}</td>
                      {/* <td className="px-6 py-4">
                        {item.gambar && (
                          <img
                            src={`${process.env.REACT_APP_API_URL}/${item.gambar}`}
                            alt={item.nama_katalog}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                      </td> */}
                      <td className="px-6 py-4">
                        {item.gambar && (
                          <img
                            src={getImageUrl(item.gambar)}
                            alt={item.nama_katalog}
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
                            onClick={() => handleShowAddStockModal(item)}
                            className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                          >
                            Add Stock
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                          {item.deleted_at && (
                            <button
                              onClick={() => handleRestore(item.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      Tidak ada data katalog yang tersedia
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCatalogs.length)} of {filteredCatalogs.length} entries
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page}
                  className={`px-3 py-1 ${currentPage === page ? 'bg-brown-600 text-white' : 'border'} rounded`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              
              <button 
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin ingin menghapus produk ini?</p>
          <Form.Group className="mb-3">
            <Form.Label>Alasan (opsional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Masukkan alasan penghapusan"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Tambah Stok */}
      <Modal show={showAddStockModal} onHide={() => setShowAddStockModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Stok Produk</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tambah stok untuk produk: <strong>{selectedCatalogName}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Jumlah Stok</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={stockAmount}
              onChange={(e) => setStockAmount(parseInt(e.target.value) || 1)}
              placeholder="Masukkan jumlah stok yang akan ditambahkan"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddStockModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={confirmAddStock}>
            Tambah Stok
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TabelPakaian;