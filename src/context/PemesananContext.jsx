import React, { createContext, useContext, useState } from 'react';

const PemesananContext = createContext();

export const PemesananProvider = ({ children }) => {
  const [pesananList, setPesananList] = useState([
    {
      id: 1,
      jenisPakaian: 'Kaos',
      bahan: 'Cotton Combed 30s',
      warna: 'Hitam, Putih',
      ukuran: 'M',
      jumlah: 5,
      referensiFoto: '/images/kaos-polos.jpg',
      catatanTambahan: 'Tolong tambahkan logo kecil di bagian dada kiri',
      status: 'Pending',
      tanggalPesan: '2024-04-29',
      namaPemesan: 'John Doe',
      nomorHP: '081234567890',
      alamat: 'Jl. Example No. 123',
      totalHarga: 375000
    }
  ]);

  const addPesanan = (newPesanan) => {
    setPesananList(prev => [...prev, { ...newPesanan, id: Date.now() }]);
  };

  const updatePesanan = (id, updatedPesanan) => {
    setPesananList(prev =>
      prev.map(pesanan =>
        pesanan.id === id ? { ...updatedPesanan, id } : pesanan
      )
    );
  };

  const deletePesanan = (id) => {
    setPesananList(prev => prev.filter(pesanan => pesanan.id !== id));
  };

  return (
    <PemesananContext.Provider value={{
      pesananList,
      addPesanan,
      updatePesanan,
      deletePesanan
    }}>
      {children}
    </PemesananContext.Provider>
  );
};

export const usePemesanan = () => useContext(PemesananContext); 