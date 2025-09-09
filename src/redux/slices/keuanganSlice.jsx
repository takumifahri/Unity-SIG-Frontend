import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Load initial data from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedKeuangan = localStorage.getItem('keuanganList');
    return savedKeuangan ? JSON.parse(savedKeuangan) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

// Save keuangan data to localStorage
export const saveKeuanganToLocalStorage = createAsyncThunk(
  'keuangan/saveToLocalStorage',
  async (_, { getState }) => {
    try {
      const { keuanganList } = getState().keuangan;
      localStorage.setItem('keuanganList', JSON.stringify(keuanganList));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }
);

const initialState = {
  keuanganList: loadFromLocalStorage(),
  loading: false,
  error: null
};

const keuanganSlice = createSlice({
  name: 'keuangan',
  initialState,
  reducers: {
    addKeuangan: (state, action) => {
      state.keuanganList.push({ ...action.payload, id: Date.now() });
    },
    updateKeuangan: (state, action) => {
      const { id, updatedData } = action.payload;
      state.keuanganList = state.keuanganList.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      );
    },
    deleteKeuangan: (state, action) => {
      state.keuanganList = state.keuanganList.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveKeuanganToLocalStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveKeuanganToLocalStorage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveKeuanganToLocalStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addKeuangan, updateKeuangan, deleteKeuangan } = keuanganSlice.actions;
export default keuanganSlice.reducer;

// Middleware to save to localStorage whenever state changes
export const keuanganPersistMiddleware = store => next => action => {
  const result = next(action);
  const isKeuanganAction = 
    action.type.startsWith('keuangan/') && 
    !action.type.includes('saveToLocalStorage');
  
  if (isKeuanganAction) {
    store.dispatch(saveKeuanganToLocalStorage());
  }
  
  return result;
};