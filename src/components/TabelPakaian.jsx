import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { usePakaian } from '../context/PakaianContext';

// Skeleton Component for loading state
const TableSkeleton = ({ rowsCount = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(7)].map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-2.5 bg-gray-200 rounded-full w-24 mb-2.5"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rowsCount)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200">
                <td className="px-6 py-4">
                  <div className="h-2.5 bg-gray-200 rounded-full w-24 mb-2.5"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2.5 bg-gray-200 rounded-full w-32 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-48"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2.5 bg-gray-200 rounded-full w-16 mb-2.5"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2.5 bg-gray-200 rounded-full w-10 mb-2.5"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-2.5 bg-gray-200 rounded-full w-20 mb-2.5"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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
    
    try {
      // Coba parse jika string JSON
      if (typeof gambar === 'string') {
        try {
          const parsed = JSON.parse(gambar);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return `${process.env.REACT_APP_API_URL}/${parsed[0]}`;
          }
          return `${process.env.REACT_APP_API_URL}/${parsed}`;
        } catch (e) {
          // Bukan JSON, kembalikan sebagai string biasa
          return `${process.env.REACT_APP_API_URL}/${gambar}`;
        }
      }
      
      // Jika gambar adalah array, ambil yang pertama
      if (Array.isArray(gambar)) {
        return gambar.length > 0 
          ? `${process.env.REACT_APP_API_URL}/${gambar[0]}`
          : '';
      }
      
      // Fallback
      return `${process.env.REACT_APP_API_URL}/${gambar}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '';
    }
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
    navigate('/admin/pakaian/edit/' + catalog.id);
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
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Katalog Produk</h2>
      
      {/* Table Controls - Responsive Layout */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
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
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            >
              <option value="">Semua Kategori</option>
              <option value="1">Kemeja</option>
              <option value="2">Kaos</option>
              <option value="3">Jaket</option>
              <option value="4">Celana</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama/deskripsi..."
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
            <button 
              onClick={handleSearch}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
            >
              Cari
            </button>
          </div>
          <button
          onClick={() => {
            setEditingCatalog(null);
            navigate('/admin/catalog/add');
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
        >
          Tambah Katalog
        </button>
        </div>

        
      </div>

      {loading ? (
        <TableSkeleton rowsCount={entriesPerPage > 5 ? 5 : entriesPerPage} />
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Responsive Table with horizontal scroll on small screens */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Bahan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gambar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCatalogs.length > 0 ? (
                  currentCatalogs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nama_katalog}
                        {/* Show mobile description view */}
                        <span className="block md:hidden text-xs text-gray-500 mt-1">
                          {item.deskripsi && item.deskripsi.length > 25 
                            ? `${item.deskripsi.substring(0, 25)}...` 
                            : item.deskripsi}
                        </span>
                        {/* Show mobile bahan view */}
                        <span className="block sm:hidden text-xs text-gray-500 mt-1">
                          Bahan: {item.bahan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {item.deskripsi && item.deskripsi.length > 50 
                          ? `${item.deskripsi.substring(0, 50)}...` 
                          : item.deskripsi}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {item.bahan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.stok}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Rp {parseInt(item.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.gambar && (
                          <img
                            src={getImageUrl(item.gambar)}
                            alt={item.nama_katalog}
                            className="h-12 w-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleShowAddStockModal(item)}
                            className="px-3 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600"
                          >
                            Add Stock
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                          {item.deleted_at && (
                            <button
                              onClick={() => handleRestore(item.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
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
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">Tidak ada data katalog yang tersedia</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm || filterType ? 'Coba ubah filter pencarian' : 'Tambahkan produk baru untuk mulai mengelola katalog'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Responsive Pagination */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-4">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCatalogs.length)} of {filteredCatalogs.length} entries
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              <button 
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // Show limited number of pages on mobile
                .filter(page => {
                  const windowWidth = window.innerWidth;
                  if (windowWidth < 640) { // Small screens
                    return page === 1 || page === totalPages || 
                           (page >= currentPage - 1 && page <= currentPage + 1);
                  }
                  return page === 1 || page === totalPages || 
                         (page >= currentPage - 2 && page <= currentPage + 2);
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <span className="px-3 py-1 text-gray-500">...</span>
                      )}
                      <button 
                        className={`px-3 py-1 ${currentPage === page ? 'bg-brown-600 text-white' : 'border'} rounded text-sm`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                      {showEllipsisAfter && (
                        <span className="px-3 py-1 text-gray-500">...</span>
                      )}
                    </React.Fragment>
                  );
                })
              }
              
              <button 
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                disabled={currentPage === totalPages || totalPages === 0}
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