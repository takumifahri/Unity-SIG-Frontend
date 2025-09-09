import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Load initial data from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedPesanan = localStorage.getItem('pesananList');
    return savedPesanan ? JSON.parse(savedPesanan) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

// Save to localStorage
export const savePesananToLocalStorage = createAsyncThunk(
  'pesanan/saveToLocalStorage',
  async (_, { getState }) => {
    try {
      const { pesananList } = getState().pesanan;
      localStorage.setItem('pesananList', JSON.stringify(pesananList));
      console.log('Data saved to localStorage:', pesananList);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }
);

const initialState = {
  pesananList: loadFromLocalStorage(),
  loading: false,
  error: null
};

const pesananSlice = createSlice({
  name: 'pesanan',
  initialState,
  reducers: {
    addPesanan: (state, action) => {
      const newPesanan = {
        ...action.payload,
        status: 'Pending',
        tanggalPesan: new Date().toISOString()
      };
      state.pesananList.push(newPesanan);
    },
    updateStatus: (state, action) => {
      const { id, newStatus } = action.payload;
      const pesanan = state.pesananList.find(p => p.id === id);
      if (pesanan) {
        pesanan.status = newStatus;
      }
    },
    deletePesanan: (state, action) => {
      state.pesananList = state.pesananList.filter(p => p.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(savePesananToLocalStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(savePesananToLocalStorage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(savePesananToLocalStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addPesanan, updateStatus, deletePesanan } = pesananSlice.actions;
export default pesananSlice.reducer;

// Middleware to save to localStorage whenever state changes
export const pesananPersistMiddleware = store => next => action => {
  const result = next(action);
  const isPesananAction = 
    action.type.startsWith('pesanan/') && 
    !action.type.includes('saveToLocalStorage');
  
  if (isPesananAction) {
    store.dispatch(savePesananToLocalStorage());
  }
  
  return result;
};