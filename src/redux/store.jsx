import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import cartReducer from '../redux/slices/cartSlice';
import reviewReducer from '../redux/slices/reviewSlice';
import pakaianReducer from '../redux/slices/pakaianSlice';
import pemesananReducer from '../redux/slices/pemesananSlice';
import pesananReducer from '../redux/slices/pesananSlice';
import keuanganReducer from '../redux/slices/keuanganSlice';
import { pesananPersistMiddleware } from '../redux/slices/pesananSlice';
import { keuanganPersistMiddleware } from '../redux/slices/keuanganSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    review: reviewReducer,
    pakaian: pakaianReducer,
    pemesanan: pemesananReducer,
    pesanan: pesananReducer,
    keuangan: keuanganReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      pesananPersistMiddleware,
      keuanganPersistMiddleware
    ]),
});