import React, { useState, useEffect } from 'react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useKeuangan } from '../context/KeuanganContext';

const KeuanganPemasukan = () => {
  const { keuanganList } = useKeuangan();
  const pemasukanList = keuanganList.filter(item => item.jenisKeuangan === 'Pemasukan');

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(pemasukanList.map(item => ({
      No: item.id,
      Keterangan: item.keterangan,
      'Jenis Pembayaran': item.jenisPembayaran,
      Nominal: item.nominal,
      Tanggal: item.tanggal,
      'Jenis Keuangan': item.jenisKeuangan
    })));

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
    writeFile(wb, 'laporan_keuangan.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text('Laporan Keuangan JR Konveksi', 14, 15);

    const tableColumn = ['No', 'Keterangan', 'Jenis Pembayaran', 'Nominal', 'Tanggal', 'Jenis Keuangan'];
    const tableRows = pemasukanList.map(item => [
      item.id,
      item.keterangan,
      item.jenisPembayaran,
      `Rp ${item.nominal.toLocaleString()}`,
      item.tanggal,
      item.jenisKeuangan
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center'
      },
      headStyles: {
        fillColor: [120, 87, 69],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      }
    });

    doc.save('laporan_keuangan.pdf');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Pemasukan</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Keterangan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Jenis Pembayaran</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nominal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Jenis Keuangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pemasukanList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.keterangan}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.jenisPembayaran}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Rp {item.nominal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.jenisKeuangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeuanganPemasukan;