import { useState, useEffect } from 'react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { Avatar } from '@mui/material';
const KeuanganPemasukan = () => {
  const [pemasukanList, setPemasukanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // State untuk data ringkasan
  const [summaryData, setSummaryData] = useState({
    bulanIni: 0,
    bulanLalu: 0,
    selisih: 0
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

  // Fungsi untuk mengambil data pemasukan dari API
  const fetchPemasukan = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/keuangan`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Filter hanya data pemasukan
      const pemasukanData = res.data.data.filter(item => 
        item.jenis_keuangan?.toLowerCase() === 'pemasukan'
      );
      
      // Hitung data ringkasan
      const summary = calculateSummary(pemasukanData);
      setSummaryData(summary);
      
      setPemasukanList(pemasukanData);
      setError(null);
    } catch (err) {
      console.error('Error fetching pemasukan data:', err);
      setError('Gagal memuat data pemasukan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Export ke Excel
  const exportToExcel = () => {
    const dataToExport = pemasukanList.map((item, index) => ({
      No: index + 1,
      'ID Transaksi': item.id || '-',
      Keterangan: item.keterangan || '-',
      'Jenis Pembayaran': item.jenis_pembayaran || '-',
      Nominal: item.nominal || 0,
      Tanggal: item.tanggal || '-',
      'Nama Pelanggan': item.user?.name || '-',
      'Email Pelanggan': item.user?.email || '-',
      'No. Telepon': item.user?.phone || '-',
      'Tipe Order': item.order?.type || '-',
      'Status Order': item.order?.status || '-'
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
      { wch: 20 }, // Nama Pelanggan
      { wch: 25 }, // Email Pelanggan
      { wch: 15 }, // No. Telepon
      { wch: 15 }, // Tipe Order
      { wch: 15 }  // Status Order
    ];
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Laporan Pemasukan');
    
    // Menambahkan judul dan informasi tambahan
    const now = new Date();
    const fileName = `laporan_pemasukan_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    writeFile(wb, fileName);
  };

  // Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Menambahkan judul
    doc.setFontSize(16);
    doc.text('Laporan Pemasukan JR Konveksi', 14, 15);
    
    // Menambahkan tanggal laporan
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Menambahkan total pemasukan
    doc.text(`Total Pemasukan Bulan Ini: ${formatCurrency(summaryData.bulanIni)}`, 14, 28);

    const tableColumn = [
      'No', 
      'ID', 
      'Keterangan', 
      'Jenis Pembayaran', 
      'Nominal', 
      'Tanggal', 
      'Pelanggan'
    ];
    
    const tableRows = pemasukanList.map((item, index) => [
      index + 1,
      item.id || '-',
      item.keterangan || '-',
      item.jenis_pembayaran || '-',
      formatCurrency(item.nominal || 0),
      formatDate(item.tanggal),
      item.user?.name || '-'
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
        6: { cellWidth: 'auto' }
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
    const fileName = `laporan_pemasukan_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;
    
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

  useEffect(() => {
    fetchPemasukan();
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Pemasukkan</h1>
      
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Kartu Total Pemasukan Bulan Ini */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-green-500"></div>
          <div className="p-4 w-full">
            <p className="text-lg sm:text-lg font-medium text-green-600 uppercase">
              TOTAL PEMASUKKAN<br />(BULAN INI)
            </p>
            <p className="text-lg sm:text-xl font-bold mt-2">
              {formatCurrency(summaryData.bulanIni)}
            </p>
            <p className="text-lg text-gray-500 mt-1">{getCurrentMonthName()} {new Date().getFullYear()}</p>
          </div>
        </div>
        
        {/* Kartu Total Pemasukan Bulan Lalu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-blue-500"></div>
          <div className="p-4 w-full">
            <p className="text-lg sm:text-lg font-medium text-blue-600 uppercase">
              TOTAL PEMASUKKAN<br />(BULAN LALU)
            </p>
            <p className="text-lg sm:text-xl font-bold mt-2">
              {formatCurrency(summaryData.bulanLalu)}
            </p>
            <p className="text-lg text-gray-500 mt-1">{getLastMonthName()} {new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()}</p>
          </div>
        </div>
        
        {/* Kartu Selisih Pemasukan */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <div className="w-2 bg-yellow-500"></div>
          <div className="p-4 w-full">
            <p className="text-lg sm:text-lg font-medium text-yellow-600 uppercase">
              SELISIH<br />PEMASUKKAN
            </p>
            <p className={`text-lg sm:text-xl font-bold mt-2 ${summaryData.selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(summaryData.selisih))}
              <span className="text-lg ml-1">
                {summaryData.selisih >= 0 ? '↑' : '↓'}
              </span>
            </p>
            <p className="text-lg text-gray-500 mt-1">
              {summaryData.selisih >= 0 ? 'Kenaikan' : 'Penurunan'} dari bulan lalu
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportToExcel}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center transition-colors text-lg sm:text-base"
            disabled={loading || pemasukanList.length === 0}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden xs:inline">Export</span> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors text-lg sm:text-base"
            disabled={loading || pemasukanList.length === 0}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden xs:inline">Export</span> PDF
          </button>
          <button
            onClick={fetchPemasukan}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center transition-colors text-lg sm:text-base ml-auto"
            disabled={loading}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 text-lg sm:text-base">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : pemasukanList.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-lg sm:text-base">
            Tidak ada data pemasukan yang tersedia.
          </div>
        ) : (
          <>
            {/* Desktop and Tablet View (Hidden on Mobile) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">No</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">ID</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">Keterangan</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">Jenis Pembayaran</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">Nominal</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">Tanggal</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">Pelanggan</th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-lg md:text-lg font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pemasukanList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg text-gray-500">{item.order.order_unique_id || 'ORD-NotFound404'}</td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg text-gray-500 max-w-[150px] md:max-w-[200px] truncate" title={item.keterangan || '-'}>
                        {item.keterangan || '-'}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg text-gray-500">{item.jenis_pembayaran || '-'}</td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg font-medium text-green-600">
                        {formatCurrency(item.nominal || 0)}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg text-gray-500">{formatDate(item.tanggal)}</td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg text-gray-500">
                        {item.user ? (
                          <div className='flex gap-2'>
                            <Avatar src={`${process.env.REACT_APP_API_URL}/${item.user.profile_photo}` || ''} alt={item.user.name} sx={{width:35, height:35}} className=" rounded-full" />

                            <div>
                              <div className="font-medium">{item.user.name}</div>
                              <div className="text-lg text-gray-400">{item.user.email}</div>
                            </div>
                            
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-lg md:text-lg">
                        {item.order?.status ? (
                          <span className={`px-2 py-1 rounded-full text-lg font-medium ${
                            item.order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                            item.order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.order.status}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Hidden on Tablet and Desktop) */}
            <div className="sm:hidden">
              <ul className="divide-y divide-gray-200">
                {pemasukanList.map((item, index) => (
                  <li key={item.id} className="p-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpandRow(index)}
                    >
                      <div>
                        <span className="text-lg font-medium text-gray-500">#{index + 1}</span>
                        <h3 className="text-lg font-medium truncate max-w-[180px]" title={item.keterangan || 'Transaksi'}>
                          {item.keterangan || 'Transaksi'}
                        </h3>
                        <p className="text-lg text-gray-500">{formatDate(item.tanggal)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-green-600">{formatCurrency(item.nominal || 0)}</p>
                        {item.order?.status && (
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-lg font-medium ${
                            item.order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                            item.order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.order.status}
                          </span>
                        )}
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
                      <div className="mt-3 pt-3 border-t border-gray-100 text-lg">
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
                            <p className="text-gray-500">Pelanggan:</p>
                            <p className="font-medium">{item.user?.name || '-'}</p>
                            <p className="text-gray-400">{item.user?.email || '-'}</p>
                          </div>
                          {item.order && (
                            <div className="col-span-2">
                              <p className="text-gray-500">Order:</p>
                              <p className="font-medium">
                                {item.order.type || '-'} 
                                {item.order.custom_order && ` - ${item.order.custom_order.nama_lengkap || ''}`}
                              </p>
                              <p className="text-gray-400">
                                {item.order.jumlah ? `Jumlah: ${item.order.jumlah}` : ''}
                              </p>
                            </div>
                          )}
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
  );
};

export default KeuanganPemasukan;