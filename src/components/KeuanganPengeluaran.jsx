import { useState, useEffect, useRef } from 'react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { NumericFormat } from 'react-number-format';

const KeuanganPengeluaran = () => {
  const fileInputRef = useRef(null);
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  // Add this to your state declarations at the top
  const [imagePreview, setImagePreview] = useState({
    show: false,
    url: '',
    title: ''
  });
  // State untuk data ringkasan
  const [summaryData, setSummaryData] = useState({
    bulanIni: 0,
    bulanLalu: 0,
    selisih: 0
  });
  
  // State untuk form
  const [formData, setFormData] = useState({
    keterangan: '',
    jenis_pembayaran: 'Cash',
    nominal: '',
    tanggal: new Date().toISOString().split('T')[0],
    bukti_pembayaran: null
  });
  
  // State untuk pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  
  // Skeleton rows untuk loading
  const skeletonRows = Array(5).fill(0);
  
  // Fungsi untuk memformat tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fungsi untuk memformat nominal uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  // Fungsi untuk menghitung data ringkasan
  const calculateSummary = (data) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter untuk bulan ini
    const thisMonthData = data.filter(item => {
      if (!item.tanggal) return false;
      const date = new Date(item.tanggal);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Filter untuk bulan lalu
    const lastMonthData = data.filter(item => {
      if (!item.tanggal) return false;
      const date = new Date(item.tanggal);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    // Hitung total (perhatikan nilai negatif dari backend)
    const thisMonthTotal = thisMonthData.reduce((sum, item) => sum + Math.abs(Number(item.nominal) || 0), 0);
    const lastMonthTotal = lastMonthData.reduce((sum, item) => sum + Math.abs(Number(item.nominal) || 0), 0);
    const difference = thisMonthTotal - lastMonthTotal;
    
    return {
      bulanIni: thisMonthTotal,
      bulanLalu: lastMonthTotal,
      selisih: difference
    };
  };

  // Fungsi untuk mengambil data pengeluaran dari API dengan pagination
  const fetchPengeluaran = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/keuangan/getPengeluaran?page=${page}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Cek apakah response memiliki struktur yang benar
      if (res.data && res.data.status && res.data.data) {
        // Set data pengeluaran - perhatikan struktur nested
        const pengeluaranData = res.data.data.pengeluaran.data || [];
        
        // Update pagination data
        setPagination({
          currentPage: res.data.data.pengeluaran.current_page,
          lastPage: res.data.data.pengeluaran.last_page,
          total: res.data.data.pengeluaran.total
        });
        
        // Hitung data ringkasan
        const summary = calculateSummary(pengeluaranData);
        setSummaryData(summary);
        
        setPengeluaranList(pengeluaranData);
        
        // Jika API mengirimkan total langsung, kita bisa gunakan itu
        // untuk card pengeluaran bulan ini
        if (res.data.data.total_pengeluaran) {
          setSummaryData(prev => ({
            ...prev,
            bulanIni: res.data.data.total_pengeluaran
          }));
        }
      } else {
        throw new Error('Format data tidak sesuai');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching pengeluaran data:', err);
      setError('Gagal memuat data pengeluaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change untuk pagination
  const handlePageChange = (page) => {
    fetchPengeluaran(page);
  };

  // Fungsi untuk menambah pengeluaran
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Menggunakan FormData untuk mengirim data multipart
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('keterangan', formData.keterangan);
      formDataToSubmit.append('jenis_pembayaran', formData.jenis_pembayaran);
      formDataToSubmit.append('nominal', parseInt(formData.nominal.replace(/[^\d]/g, '')));
      formDataToSubmit.append('tanggal', formData.tanggal);
      
      // Tambahkan file bukti pembayaran jika ada
      if (uploadedFile) {
        formDataToSubmit.append('bukti_pembayaran', uploadedFile);
      }
      
      // Log data sebelum mengirim untuk debugging
      console.log('Sending data:', {
        keterangan: formData.keterangan,
        jenis_pembayaran: formData.jenis_pembayaran,
        nominal: parseInt(formData.nominal.replace(/[^\d]/g, '')),
        tanggal: formData.tanggal,
        bukti_pembayaran: uploadedFile ? uploadedFile.name : 'No file'
      });
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/keuangan/lapor`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Log response untuk debugging
      console.log('Response:', response.data);
      
      // Reset form
      setFormData({
        keterangan: '',
        jenis_pembayaran: 'Cash',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        bukti_pembayaran: null
      });
      setUploadedFile(null);
      setPreviewUrl('');
      
      // Refresh data
      fetchPengeluaran(1); // Kembali ke halaman pertama setelah menambah data
      
      // Hide form on mobile after successful submission
      if (window.innerWidth < 640) {
        setFormVisible(false);
      }
      
    } catch (err) {
      console.error('Error adding pengeluaran:', err);
      
      // Log error details untuk debugging
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      
      setError(err.response?.data?.message || 'Gagal menambahkan pengeluaran. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle numeric input change
  const handleNumericChange = (values) => {
    const { value } = values;
    setFormData(prev => ({
      ...prev,
      nominal: value
    }));
  };

  // Export ke Excel
  const exportToExcel = () => {
    const dataToExport = pengeluaranList.map((item, index) => ({
      No: index + 1,
      'ID Transaksi': item.id || '-',
      Keterangan: item.keterangan || '-',
      'Jenis Pembayaran': item.jenis_pembayaran || '-',
      Nominal: Math.abs(item.nominal) || 0,
      Tanggal: item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
    }));

    const ws = utils.json_to_sheet(dataToExport);
    
    // Mengatur lebar kolom
    const colWidths = [
      { wch: 5 },  // No
      { wch: 12 }, // ID Transaksi
      { wch: 30 }, // Keterangan
      { wch: 15 }, // Jenis Pembayaran
      { wch: 15 }, // Nominal
      { wch: 20 }, // Tanggal
    ];
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Laporan Pengeluaran');
    
    // Menambahkan judul dan informasi tambahan
    const now = new Date();
    const fileName = `laporan_pengeluaran_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    writeFile(wb, fileName);
  };

  // Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Menambahkan judul
    doc.setFontSize(16);
    doc.text('Laporan Pengeluaran JR Konveksi', 14, 15);
    
    // Menambahkan tanggal laporan
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Menambahkan total pengeluaran
    doc.text(`Total Pengeluaran Bulan Ini: ${formatCurrency(summaryData.bulanIni)}`, 14, 28);

    const tableColumn = [
      'No', 
      'Nama Admin', 
      'Keterangan', 
      'Jenis Pembayaran', 
      'Nominal', 
      'Tanggal'
    ];
    
    const tableRows = pengeluaranList.map((item, index) => [
      index + 1,
      item.user.name || '-',
      item.keterangan || '-',
      item.jenis_pembayaran || '-',
      formatCurrency(Math.abs(item.nominal) || 0),
      formatDate(item.tanggal),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [120, 87, 69],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 15 },
        2: { cellWidth: 'auto' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'center' },
      }
    });

    // Menambahkan footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    const now = new Date();
    const fileName = `laporan_pengeluaran_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;
    
    doc.save(fileName);
  };

  // Toggle expanded row for mobile view
  const toggleExpandRow = (index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  // Toggle form visibility (for mobile)
  const toggleForm = () => {
    setFormVisible(!formVisible);
  };

  // Handle file input change dengan fitur drag and drop
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }
    
    if (!file.type.match('image.*')) {
      setError('Hanya file gambar yang diizinkan');
      return;
    }
    
    // Log file details for debugging
    console.log('File selected:', file.name, file.size, file.type);
    
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  // Drag over handler
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Drag leave handler
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Remove uploaded file
  const removeFile = (e) => {
    if (e) e.stopPropagation();
    setUploadedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchPengeluaran();
  }, []);

  // Mendapatkan nama bulan saat ini dan bulan lalu
  const getCurrentMonthName = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    return months[now.getMonth()];
  };

  const getLastMonthName = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    return months[lastMonth];
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Pengeluaran</h1>
      
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Kartu Total Pengeluaran Bulan Ini */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-red-500"></div>
          <div className="p-4 w-full">
            {loading ? (
              <>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
              </>
            ) : (
              <>
                <p className="text-xs sm:text-sm font-medium text-red-600 uppercase">
                  TOTAL PENGELUARAN<br />(BULAN INI)
                </p>
                <p className="text-lg sm:text-xl font-bold mt-2">
                  {formatCurrency(summaryData.bulanIni)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{getCurrentMonthName()} {new Date().getFullYear()}</p>
              </>
            )}
          </div>
        </div>
        
        {/* Kartu Total Pengeluaran Bulan Lalu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-blue-500"></div>
          <div className="p-4 w-full">
            {loading ? (
              <>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
              </>
            ) : (
              <>
                <p className="text-xs sm:text-sm font-medium text-blue-600 uppercase">
                  TOTAL PENGELUARAN<br />(BULAN LALU)
                </p>
                <p className="text-lg sm:text-xl font-bold mt-2">
                  {formatCurrency(summaryData.bulanLalu)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{getLastMonthName()} {new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()}</p>
              </>
            )}
          </div>
        </div>
        
        {/* Kartu Selisih Pengeluaran */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-yellow-500"></div>
          <div className="p-4 w-full">
            {loading ? (
              <>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mt-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
              </>
            ) : (
              <>
                <p className="text-xs sm:text-sm font-medium text-yellow-600 uppercase">
                  SELISIH<br />PENGELUARAN
                </p>
                <p className={`text-lg sm:text-xl font-bold mt-2 ${summaryData.selisih <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(summaryData.selisih))}
                  <span className="text-sm ml-1">
                    {summaryData.selisih <= 0 ? '↓' : '↑'}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryData.selisih <= 0 ? 'Penurunan' : 'Kenaikan'} dari bulan lalu
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportToExcel}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center transition-colors text-sm sm:text-base"
            disabled={loading || pengeluaranList.length === 0}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden xs:inline">Export</span> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors text-sm sm:text-base"
            disabled={loading || pengeluaranList.length === 0}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden xs:inline">Export</span> PDF
          </button>
          <button
            onClick={() => fetchPengeluaran(1)}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center transition-colors text-sm sm:text-base"
            disabled={loading}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden xs:inline">Refresh</span>
          </button>
          
          {/* Tombol Tambah Pengeluaran (Mobile Only) */}
          <button
            onClick={toggleForm}
            className="sm:hidden ml-auto px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 text-sm sm:text-base">
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Pengeluaran (Desktop/Tablet: Selalu Tampil, Mobile: Toggle) */}
        <div className={`lg:col-span-1 ${formVisible ? 'block' : 'hidden sm:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Tambah Pengeluaran</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Pembayaran
                </label>
                <select
                  name="jenis_pembayaran"
                  value={formData.jenis_pembayaran}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal
                </label>
                <NumericFormat
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  value={formData.nominal}
                  onValueChange={handleNumericChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  placeholder="Rp 0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bukti Pembayaran (Opsional)
                </label>
                
                {/* Custom file uploader with dropify-like features */}
                <div 
                  className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                    ${previewUrl ? 'border-green-400 bg-green-50' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    name='bukti_pembayaran'
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                  />
                  
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="mx-auto h-36 object-contain"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        {uploadedFile?.name} ({(uploadedFile?.size / 1024).toFixed(1)} KB)
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(e);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-400" 
                        stroke="currentColor" 
                        fill="none" 
                        viewBox="0 0 48 48" 
                        aria-hidden="true"
                      >
                        <path 
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                      <div className="flex flex-col items-center text-sm text-gray-600 mt-2">
                        <p className="font-medium">Klik untuk upload atau tarik gambar ke sini</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF (Maks. 2MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex justify-center items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Tambah Pengeluaran'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tabel Pengeluaran */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop and Tablet View (Hidden on Mobile) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">No</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Nama Admin</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Keterangan</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Jenis Pembayaran</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Nominal</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Tanggal</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    // Skeleton loading untuk tabel
                    skeletonRows.map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-5"></div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-28 md:w-40"></div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                        </td>
                      </tr>
                    ))
                  ) : pengeluaranList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 md:px-6 md:py-10 text-center text-gray-500">
                        <svg 
                          className="mx-auto h-12 w-12 text-gray-400 mb-3" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <p>Data pengeluaran masih kosong</p>
                        <p className="text-sm text-gray-400 mt-1">Tambahkan data pengeluaran baru menggunakan form di samping</p>
                      </td>
                    </tr>
                  ) : (
                    pengeluaranList.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{item.user.name || '-'}</td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 max-w-[150px] md:max-w-[200px] truncate" title={item.keterangan || '-'}>
                          {item.keterangan || '-'}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{item.jenis_pembayaran || '-'}</td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-red-600">
                          {formatCurrency(Math.abs(item.nominal) || 0)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{formatDate(item.tanggal)}</td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                          {item.bukti_pembayaran ? (
                            <div className="relative inline-block">
                              <img 
                                src={`${process.env.REACT_APP_API_URL}/${item.bukti_pembayaran}`}
                                alt="Bukti Pembayaran" 
                                className="h-8 w-8 object-cover rounded border border-gray-300 cursor-pointer hover:border-blue-500"
                                onClick={() => {
                                  setImagePreview({
                                    show: true,
                                    url: `${process.env.REACT_APP_API_URL}/${item.bukti_pembayaran}`,
                                    title: `Bukti Pembayaran - ${item.keterangan || 'Transaksi'}`
                                  });
                                }}
                              />
                               {/* Image Preview Modal */}
                                {imagePreview.show && (
                                  <div 
                                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
                                    onClick={() => setImagePreview({show: false, url: '', title: ''})}
                                  >
                                    <div 
                                      className="bg-white rounded-lg overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">{imagePreview.title}</h3>
                                        <button 
                                          className="text-gray-400 hover:text-gray-500"
                                          onClick={() => setImagePreview({show: false, url: '', title: ''})}
                                        >
                                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                      <div className="overflow-auto p-4 flex items-center justify-center">
                                        <img 
                                          src={imagePreview.url} 
                                          alt={imagePreview.title}
                                          className="max-w-full max-h-[70vh] object-contain"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                            
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        
            {/* Mobile View (Hidden on Tablet and Desktop) */}
            <div className="sm:hidden">
              {loading ? (
                // Skeleton loading untuk mobile view
                skeletonRows.map((_, index) => (
                  <div key={`skeleton-mobile-${index}`} className="p-4 border-b border-gray-100 animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-10 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : pengeluaranList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400 mb-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  <p>Data pengeluaran masih kosong</p>
                  <p className="text-sm text-gray-400 mt-1">Tambahkan data baru dengan tombol "Tambah"</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {pengeluaranList.map((item, index) => (
                    <li key={item.id} className="p-4">
                      <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleExpandRow(index)}
                      >
                        <div>
                          <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                          <h3 className="text-sm font-medium truncate max-w-[180px]" title={item.keterangan || 'Transaksi'}>
                            {item.keterangan || 'Transaksi'}
                          </h3>
                          <p className="text-xs text-gray-500">{formatDate(item.tanggal)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">{formatCurrency(Math.abs(item.nominal) || 0)}</p>
                          <p className="text-xs text-gray-500">{item.jenis_pembayaran || '-'}</p>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedRow === index ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {expandedRow === index && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500">ID Transaksi:</p>
                              <p className="font-medium">{item.id || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Jenis Pembayaran:</p>
                              <p className="font-medium">{item.jenis_pembayaran || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-500">Keterangan Lengkap:</p>
                              <p className="font-medium">{item.keterangan || '-'}</p>
                            </div>
                            {item.bukti_pembayaran && (
                              <div className="col-span-2 mt-2">
                                <p className="text-gray-500 mb-1">Bukti Pembayaran:</p>
                                <div 
                                  className="inline-block" 
                                  onClick={() => {
                                    setImagePreview({
                                      show: true,
                                      url: `${process.env.REACT_APP_API_URL}/${item.bukti_pembayaran}`,
                                      title: `Bukti Pembayaran - ${item.keterangan || 'Transaksi'}`
                                    });
                                  }}
                                >
                                  <img 
                                    src={`${process.env.REACT_APP_API_URL}/${item.bukti_pembayaran}`}
                                    alt="Bukti Pembayaran"
                                    className="h-16 w-16 object-cover rounded border border-gray-300"
                                  />
                                </div>
                              </div>
                            )}
                            
                          </div>
                          
                         
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Pagination */}
            {!loading && pagination.lastPage > 1 && (
              <div className="px-3 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      pagination.currentPage === pagination.lastPage ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{Math.min((pagination.currentPage - 1) * 10 + 1, pagination.total)}</span> sampai{' '}
                      <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.total)}</span> dari{' '}
                      <span className="font-medium">{pagination.total}</span> data
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Generate page numbers - limit to 5 pages for better display */}
                      {pagination.lastPage <= 5 ? (
                        // If less than 5 pages, show all
                        [...Array(pagination.lastPage)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.currentPage === i + 1
                                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))
                      ) : (
                        // If more than 5 pages, show current +/- 1 and first/last
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.currentPage === 1
                                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            1
                          </button>
                          
                          {pagination.currentPage > 3 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          
                          {pagination.currentPage > 2 && (
                            <button
                              onClick={() => handlePageChange(pagination.currentPage - 1)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              {pagination.currentPage - 1}
                            </button>
                          )}
                          
                          {pagination.currentPage !== 1 && pagination.currentPage !== pagination.lastPage && (
                            <button
                              onClick={() => handlePageChange(pagination.currentPage)}
                              className="z-10 bg-amber-50 border-amber-500 text-amber-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                              {pagination.currentPage}
                            </button>
                          )}
                          
                          {pagination.currentPage < pagination.lastPage - 1 && (
                            <button
                              onClick={() => handlePageChange(pagination.currentPage + 1)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              {pagination.currentPage + 1}
                            </button>
                          )}
                          
                          {pagination.currentPage < pagination.lastPage - 2 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          
                          <button
                            onClick={() => handlePageChange(pagination.lastPage)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.currentPage === pagination.lastPage
                                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pagination.lastPage}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.lastPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.currentPage === pagination.lastPage ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeuanganPengeluaran;