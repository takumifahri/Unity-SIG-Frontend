import React, { useState, useEffect } from 'react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const KeuanganPengeluaran = () => {
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  
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
  });
  
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
    }).format(amount);
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
    
    // Hitung total
    const thisMonthTotal = thisMonthData.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    const lastMonthTotal = lastMonthData.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    const difference = thisMonthTotal - lastMonthTotal;
    
    return {
      bulanIni: thisMonthTotal,
      bulanLalu: lastMonthTotal,
      selisih: difference
    };
  };

  // Fungsi untuk mengambil data pengeluaran dari API
  const fetchPengeluaran = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/keuangan`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Filter hanya data pengeluaran
      const pengeluaranData = res.data.filter(item => 
        item.jenis_keuangan?.toLowerCase() === 'pengeluaran'
      );
      
      // Hitung data ringkasan
      const summary = calculateSummary(pengeluaranData);
      setSummaryData(summary);
      
      setPengeluaranList(pengeluaranData);
      setError(null);
    } catch (err) {
      console.error('Error fetching pengeluaran data:', err);
      setError('Gagal memuat data pengeluaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menambah pengeluaran
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const dataToSubmit = {
        keterangan: formData.keterangan,
        jenis_pembayaran: formData.jenis_pembayaran,
        nominal: parseInt(formData.nominal),
        tanggal: formData.tanggal,
        jenis_keuangan: 'pengeluaran'
      };
      
      await axios.post(`${process.env.REACT_APP_API_URL}/api/keuangan`, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Reset form
      setFormData({
        keterangan: '',
        jenis_pembayaran: 'Cash',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
      });
      
      // Refresh data
      fetchPengeluaran();
      
      // Hide form on mobile after successful submission
      if (window.innerWidth < 640) {
        setFormVisible(false);
      }
      
    } catch (err) {
      console.error('Error adding pengeluaran:', err);
      setError('Gagal menambahkan pengeluaran. Silakan coba lagi.');
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

  // Export ke Excel
  const exportToExcel = () => {
    const dataToExport = pengeluaranList.map((item, index) => ({
      No: index + 1,
      'ID Transaksi': item.id || '-',
      Keterangan: item.keterangan || '-',
      'Jenis Pembayaran': item.jenis_pembayaran || '-',
      Nominal: item.nominal || 0,
      Tanggal: item.tanggal || '-',
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
      'ID', 
      'Keterangan', 
      'Jenis Pembayaran', 
      'Nominal', 
      'Tanggal'
    ];
    
    const tableRows = pengeluaranList.map((item, index) => [
      index + 1,
      item.id || '-',
      item.keterangan || '-',
      item.jenis_pembayaran || '-',
      formatCurrency(item.nominal || 0),
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
            <p className="text-xs sm:text-sm font-medium text-red-600 uppercase">
              TOTAL PENGELUARAN<br />(BULAN INI)
            </p>
            <p className="text-lg sm:text-xl font-bold mt-2">
              {formatCurrency(summaryData.bulanIni)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{getCurrentMonthName()} {new Date().getFullYear()}</p>
          </div>
        </div>
        
        {/* Kartu Total Pengeluaran Bulan Lalu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-blue-500"></div>
          <div className="p-4 w-full">
            <p className="text-xs sm:text-sm font-medium text-blue-600 uppercase">
              TOTAL PENGELUARAN<br />(BULAN LALU)
            </p>
            <p className="text-lg sm:text-xl font-bold mt-2">
              {formatCurrency(summaryData.bulanLalu)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{getLastMonthName()} {new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()}</p>
          </div>
        </div>
        
        {/* Kartu Selisih Pengeluaran */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-yellow-500"></div>
          <div className="p-4 w-full">
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
            onClick={fetchPengeluaran}
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
            className="sm:hidden ml-auto px-3 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center transition-colors text-sm"
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
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="nominal"
                    value={formData.nominal}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    required
                  />
                </div>
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
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors flex justify-center items-center"
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
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : pengeluaranList.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
                Tidak ada data pengeluaran yang tersedia.
              </div>
            ) : (
              <>
                {/* Desktop and Tablet View (Hidden on Mobile) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">No</th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">ID</th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Keterangan</th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Jenis Pembayaran</th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Nominal</th>
                        <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-600">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pengeluaranList.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{item.id || '-'}</td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 max-w-[150px] md:max-w-[200px] truncate" title={item.keterangan || '-'}>
                            {item.keterangan || '-'}
                          </td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{item.jenis_pembayaran || '-'}</td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-red-600">
                            {formatCurrency(item.nominal || 0)}
                          </td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">{formatDate(item.tanggal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Hidden on Tablet and Desktop) */}
                <div className="sm:hidden">
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
                            <p className="text-sm font-medium text-red-600">{formatCurrency(item.nominal || 0)}</p>
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
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeuanganPengeluaran;