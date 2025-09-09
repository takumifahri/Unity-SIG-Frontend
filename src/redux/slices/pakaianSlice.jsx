import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

// Get auth headers helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Fetch catalogs with filters
export const fetchCatalogs = createAsyncThunk(
  'pakaian/fetchCatalogs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      let queryParams = new URLSearchParams();
      
      if (filters.master_jenis_id) {
        queryParams.append('master_jenis_id', filters.master_jenis_id);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      const response = await axios.get(`${apiUrl}/api/catalog?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching catalogs');
    }
  }
);

// Fetch best sellers
export const fetchBestSellers = createAsyncThunk(
  'pakaian/fetchBestSellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiUrl}/api/catalog/bestSeller`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching best sellers');
    }
  }
);

// Get catalog by ID
export const getCatalogById = createAsyncThunk(
  'pakaian/getCatalogById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiUrl}/api/catalog/show/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching catalog details');
    }
  }
);

// Add new catalog
export const addCatalog = createAsyncThunk(
  'pakaian/addCatalog',
  async (catalogData, { rejectWithValue }) => {
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
      
      // Handle colors array
      const colorsArray = catalogData.colors || [];
      
      colorsArray.forEach((color, colorIndex) => {
        formData.append(`colors[${colorIndex}][color_name]`, color.color_name);
        
        // Add sizes for each color
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
      
      const response = await axios.post(`${apiUrl}/api/catalog/store`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error adding catalog');
    }
  }
);

// Update catalog
export const updateCatalog = createAsyncThunk(
  'pakaian/updateCatalog',
  async ({ id, catalogData }, { rejectWithValue }) => {
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
        formData.append('gambar[]', catalogData.gambar);
      }
      
      const response = await axios.post(`${apiUrl}/api/catalog/update/${id}`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { id, updatedCatalog: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating catalog');
    }
  }
);

// Delete catalog
export const deleteCatalog = createAsyncThunk(
  'pakaian/deleteCatalog',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${apiUrl}/api/catalog/delete/${id}`, {
        headers: getAuthHeaders(),
      });
      
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting catalog');
    }
  }
);

const initialState = {
  catalogList: [],
  bestSellers: [],
  editingCatalog: null,
  currentCatalog: null,
  loading: false,
  error: null
};

const pakaianSlice = createSlice({
  name: 'pakaian',
  initialState,
  reducers: {
    setEditingCatalog: (state, action) => {
      state.editingCatalog = action.payload;
    },
    clearPakaianError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch catalogs
      .addCase(fetchCatalogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogs.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogList = action.payload;
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch best sellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get catalog by ID
      .addCase(getCatalogById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCatalogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCatalog = action.payload;
      })
      .addCase(getCatalogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add catalog
      .addCase(addCatalog.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogList.push(action.payload);
      })
      .addCase(addCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update catalog
      .addCase(updateCatalog.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCatalog.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updatedCatalog } = action.payload;
        state.catalogList = state.catalogList.map(catalog => 
          catalog.id === id ? updatedCatalog : catalog
        );
        if (state.currentCatalog && state.currentCatalog.id === id) {
          state.currentCatalog = updatedCatalog;
        }
      })
      .addCase(updateCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete catalog
      .addCase(deleteCatalog.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogList = state.catalogList.filter(
          catalog => catalog.id !== action.payload
        );
      })
      .addCase(deleteCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setEditingCatalog, clearPakaianError } = pakaianSlice.actions;
export default pakaianSlice.reducer;