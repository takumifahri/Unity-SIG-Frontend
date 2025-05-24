import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PakaianContext = createContext();

export const PakaianProvider = ({ children }) => {
  const [catalogList, setCatalogList] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Get token from localStorage or your auth context
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Fetch catalogs with optional filters
  const fetchCatalogs = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let queryParams = new URLSearchParams();
      
      if (filters.master_jenis_id) {
        queryParams.append('master_jenis_id', filters.master_jenis_id);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      const response = await axios.get(`${apiUrl}/api/catalog?${queryParams.toString()}`);
      setCatalogList(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching catalogs');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch best sellers
  const fetchBestSellers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/catalog/bestSeller`);
      setBestSellers(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching best sellers');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single catalog by ID
  const getCatalogById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/catalog/show/${id}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching catalog details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add new catalog
  const addCatalog = async (catalogData) => {
    setLoading(true);
    try {
      // Must use FormData for file uploads
      const formData = new FormData();
      
      // Append text fields
      formData.append('nama_katalog', catalogData.nama_katalog);
      formData.append('deskripsi', catalogData.deskripsi);
      formData.append('details', catalogData.details);
      formData.append('bahan', catalogData.bahan);
      formData.append('price', catalogData.price);
      formData.append('stok', catalogData.stok);
      formData.append('feature', catalogData.feature);
      
      // Penting: Kirim colors sebagai array (jangan stringify)
      const colorsArray = catalogData.colors || [];
      
      // Tambahkan setiap warna secara individual sesuai format yang diharapkan backend
      colorsArray.forEach((color, colorIndex) => {
        formData.append(`colors[${colorIndex}][color_name]`, color.color_name);
        
        // Tambahkan ukuran untuk setiap warna
        color.sizes.forEach((size, sizeIndex) => {
          formData.append(`colors[${colorIndex}][sizes][${sizeIndex}][size]`, size.size);
          formData.append(`colors[${colorIndex}][sizes][${sizeIndex}][stok]`, size.stok);
        });
      });
      
      // Append multiple image files
      if (catalogData.gambar && Array.isArray(catalogData.gambar)) {
        catalogData.gambar.forEach((file, index) => {
          formData.append(`gambar[${index}]`, file);
        });
      } else if (catalogData.gambar) {
        formData.append('gambar[0]', catalogData.gambar);
      }
      
      // Debug FormData sebelum dikirim
      console.log("FormData yang akan dikirim:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
      }
      
      const response = await axios.post(`${apiUrl}/api/catalog/store`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCatalogList(prev => [...prev, response.data.data]);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding catalog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update catalog
  const updateCatalog = async (id, catalogData) => {
    setLoading(true);
    try {
      // Must use FormData for file uploads
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(catalogData).forEach(key => {
        if (key !== 'gambar' && key !== 'remove_images' && key !== 'colors') {
          if (typeof catalogData[key] === 'object') {
            formData.append(key, JSON.stringify(catalogData[key]));
          } else {
            formData.append(key, catalogData[key]);
          }
        }
      });
      
      // Append colors array as JSON
      if (catalogData.colors) {
        formData.append('colors', JSON.stringify(catalogData.colors));
      }
      
      // Append remove_images array if provided
      if (catalogData.remove_images && Array.isArray(catalogData.remove_images)) {
        catalogData.remove_images.forEach((path, index) => {
          formData.append(`remove_images[${index}]`, path);
        });
      }
      
      // Append multiple image files if provided
      if (catalogData.gambar && Array.isArray(catalogData.gambar)) {
        catalogData.gambar.forEach(file => {
          formData.append('gambar[]', file);
        });
      } else if (catalogData.gambar instanceof File) {
        // For backward compatibility if gambar is a single file
        formData.append('gambar[]', catalogData.gambar);
      }
      
      const response = await axios.post(`${apiUrl}/api/catalog/update/${id}`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCatalogList(prev => 
        prev.map(catalog => catalog.id === id ? response.data.data : catalog)
      );
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating catalog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add stock to catalog
  const addStock = async (id, stockAmount) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/catalog/addStock/${id}`, 
        { stok: stockAmount },
        { headers: getAuthHeaders() }
      );
      
      setCatalogList(prev => 
        prev.map(catalog => catalog.id === id ? response.data.data : catalog)
      );
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding stock');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete catalog
  const deleteCatalog = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/catalog/delete/${id}`, {
        headers: getAuthHeaders(),
      });
      
      setCatalogList(prev => prev.filter(catalog => catalog.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting catalog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete catalog with reason (adjust if your API supports this)
  const deleteCatalogWithReason = async (id, reason) => {
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/catalog/delete/${id}`, {
        headers: getAuthHeaders(),
        data: { reason }
      });
      
      setCatalogList(prev => prev.filter(catalog => catalog.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting catalog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restore deleted catalog (if your API supports this)
  const restoreCatalog = async (id, reason = null) => {
    setLoading(true);
    try {
      // Adjust this endpoint if your API has a specific restore endpoint
      const response = await axios.post(
        `${apiUrl}/api/catalog/restore/${id}`, 
        { reason },
        { headers: getAuthHeaders() }
      );
      
      // Fetch catalogs again after restore
      await fetchCatalogs();
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error restoring catalog');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchCatalogs();
    fetchBestSellers();
  }, []);

  return (
    <PakaianContext.Provider value={{
      catalogList,
      bestSellers,
      editingCatalog,
      setEditingCatalog,
      loading,
      error,
      fetchCatalogs,
      fetchBestSellers,
      getCatalogById,
      addCatalog,
      updateCatalog,
      addStock,
      deleteCatalog,
      deleteCatalogWithReason,
      restoreCatalog
    }}>
      {children}
    </PakaianContext.Provider>
  );
};

export const usePakaian = () => useContext(PakaianContext);