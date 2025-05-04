import React, { createContext, useContext, useState } from 'react';

const PakaianContext = createContext();

export const PakaianProvider = ({ children }) => {
  const [pakaianList, setPakaianList] = useState([]);
  const [editingPakaian, setEditingPakaian] = useState(null);

  const addPakaian = (newPakaian) => {
    setPakaianList(prev => [...prev, { ...newPakaian, id: Date.now() }]);
  };

  const updatePakaian = (id, updatedPakaian) => {
    setPakaianList(prev => 
      prev.map(pakaian => 
        pakaian.id === id ? { ...updatedPakaian, id } : pakaian
      )
    );
  };

  const deletePakaian = (id) => {
    setPakaianList(prev => prev.filter(pakaian => pakaian.id !== id));
  };

  return (
    <PakaianContext.Provider value={{
      pakaianList,
      editingPakaian,
      setEditingPakaian,
      addPakaian,
      updatePakaian,
      deletePakaian
    }}>
      {children}
    </PakaianContext.Provider>
  );
};

export const usePakaian = () => useContext(PakaianContext); 