import React, { createContext, useContext, useState, useEffect } from 'react';

const PesananContext = createContext();

export const PesananProvider = ({ children }) => {
  const [pesananList, setPesananList] = useState(() => {
    try {
      const savedPesanan = localStorage.getItem('pesananList');
      return savedPesanan ? JSON.parse(savedPesanan) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pesananList', JSON.stringify(pesananList));
      console.log('Data saved to localStorage:', pesananList);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [pesananList]);

  const addPesanan = (newPesanan) => {
    setPesananList(prevList => {
      const updatedList = [...prevList, {
        ...newPesanan,
        status: 'Pending',
        tanggalPesan: new Date().toISOString()
      }];
      return updatedList;
    });
  };

  const updateStatus = (id, newStatus) => {
    setPesananList(prevList =>
      prevList.map(pesanan =>
        pesanan.id === id ? { ...pesanan, status: newStatus } : pesanan
      )
    );
  };

  const deletePesanan = (id) => {
    setPesananList(prev => prev.filter(pesanan => pesanan.id !== id));
  };

  // Debug: Log setiap kali pesananList berubah
  useEffect(() => {
    console.log('Current pesananList:', pesananList);
  }, [pesananList]);

  const value = {
    pesananList,
    addPesanan,
    updateStatus,
    deletePesanan
  };

  return (
    <PesananContext.Provider value={value}>
      {children}
    </PesananContext.Provider>
  );
};

export const usePesanan = () => {
  const context = useContext(PesananContext);
  if (!context) {
    throw new Error('usePesanan must be used within a PesananProvider');
  }
  return context;
};

export default PesananProvider; 