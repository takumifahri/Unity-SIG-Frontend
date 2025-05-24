import React, { createContext, useContext, useState } from 'react';

const BahanContext = createContext();

export const BahanProvider = ({ children }) => {
  const [bahanList, setBahanList] = useState([]);
  const [editingBahan, setEditingBahan] = useState(null);

  const addBahan = (newBahan) => {
    setBahanList(prev => [...prev, { ...newBahan, id: Date.now() }]);
  };

  const updateBahan = (id, updatedBahan) => {
    setBahanList(prev => 
      prev.map(bahan => 
        bahan.id === id ? { ...updatedBahan, id } : bahan
      )
    );
  };

  const deleteBahan = (id) => {
    setBahanList(prev => prev.filter(bahan => bahan.id !== id));
  };

  return (
    <BahanContext.Provider value={{
      bahanList,
      editingBahan,
      setEditingBahan,
      addBahan,
      updateBahan,
      deleteBahan
    }}>
      {children}
    </BahanContext.Provider>
  );
};

export const useBahan = () => useContext(BahanContext); 