import React, { createContext, useContext, useState, useEffect } from 'react';

const KeuanganContext = createContext();

export const useKeuangan = () => {
  const context = useContext(KeuanganContext);
  if (!context) {
    throw new Error('useKeuangan must be used within a KeuanganProvider');
  }
  return context;
};

export const KeuanganProvider = ({ children }) => {
  const [keuanganList, setKeuanganList] = useState(() => {
    const savedKeuangan = localStorage.getItem('keuanganList');
    return savedKeuangan ? JSON.parse(savedKeuangan) : [];
  });

  useEffect(() => {
    localStorage.setItem('keuanganList', JSON.stringify(keuanganList));
  }, [keuanganList]);

  const addKeuangan = (newKeuangan) => {
    setKeuanganList(prev => [...prev, { ...newKeuangan, id: Date.now() }]);
  };

  return (
    <KeuanganContext.Provider value={{ keuanganList, addKeuangan }}>
      {children}
    </KeuanganContext.Provider>
  );
};

export default KeuanganProvider; 