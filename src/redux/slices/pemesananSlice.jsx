import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  'pemesanan/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return [];
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Fetch all custom orders and regular orders
export const fetchAllCustomAndOrders = createAsyncThunk(
  'pemesanan/fetchAllCustomAndOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return { orders: [], custom_orders: [], transactions: [] };
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/all`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.data || { orders: [], custom_orders: [], transactions: [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Fetch active orders
export const fetchActiveOrders = createAsyncThunk(
  'pemesanan/fetchActiveOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return [];
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/tracking`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active orders");
    }
  }
);

// Fetch order history
export const fetchOrderHistory = createAsyncThunk(
  'pemesanan/fetchOrderHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return [];
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/history`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order history");
    }
  }
);

// Get order details by ID
export const getOrderByUniqueId = createAsyncThunk(
  'pemesanan/getOrderByUniqueId',
  async (orderUniqueId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !orderUniqueId) {
        throw new Error(orderUniqueId ? "No authentication token found" : "Order ID is required");
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/show/${orderUniqueId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order details");
    }
  }
);

// Get custom order details by ID
export const getCustomOrderById = createAsyncThunk(
  'pemesanan/getCustomOrderById',
  async (orderUniqueId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !orderUniqueId) {
        throw new Error(orderUniqueId ? "No authentication token found" : "Order ID is required");
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/custom/show/${orderUniqueId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch custom order details");
    }
  }
);

// Checkout
export const checkoutOrder = createAsyncThunk(
  'pemesanan/checkout',
  async (checkoutData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/checkout`,
        checkoutData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // After checkout, fetch updated data
      dispatch(fetchActiveOrders());
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete checkout");
    }
  }
);

// Upload payment proof
export const uploadPaymentProof = createAsyncThunk(
  'pemesanan/uploadPaymentProof',
  async ({ transactionId, buktiPembayaran }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const formData = new FormData();
      formData.append('transaction_id', transactionId);
      formData.append('bukti_pembayaran', buktiPembayaran);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/checkout/buktibayar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // After upload, fetch updated active orders
      dispatch(fetchActiveOrders());
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload payment proof");
    }
  }
);

// Receive order as user
export const receiveOrder = createAsyncThunk(
  'pemesanan/receiveOrder',
  async ({ orderId, formData }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/recieved/${orderId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // After receiving order, fetch updated data
      dispatch(fetchAllCustomAndOrders());
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to confirm delivery receipt");
    }
  }
);

// Propose custom order
export const proposeCustomOrder = createAsyncThunk(
  'pemesanan/proposeCustomOrder',
  async (customOrderData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const formData = new FormData();
      
      // Append all custom order data to formData
      Object.keys(customOrderData).forEach(key => {
        if (key === 'gambar_referensi' && customOrderData[key]) {
          formData.append(key, customOrderData[key]);
        } else {
          formData.append(key, customOrderData[key]);
        }
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/propose`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to propose custom order");
    }
  }
);

// Accept custom order
export const acceptCustomOrder = createAsyncThunk(
  'pemesanan/acceptCustomOrder',
  async (acceptData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/accept/propose`,
        acceptData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept custom order");
    }
  }
);

// Admin verify payment
export const adminVerifyPayment = createAsyncThunk(
  'pemesanan/adminVerifyPayment',
  async ({ orderId, status, reason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const data = { status };
      
      if (reason && status === 'reject') {
        data.reason = reason;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/admin/verif/${orderId}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to verify payment");
    }
  }
);

// Send order to delivery
export const sendToDelivery = createAsyncThunk(
  'pemesanan/sendToDelivery',
  async ({ orderId, deliveryData }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const formData = new FormData();
      
      // Append all delivery data to formData
      Object.keys(deliveryData).forEach(key => {
        formData.append(key, deliveryData[key]);
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/sendToDelivery/${orderId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh orders after sending to delivery
      dispatch(fetchAllCustomAndOrders());
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send to delivery");
    }
  }
);

const initialState = {
  orders: [],
  customOrders: [],
  transactions: [],
  activeOrders: [],
  orderHistory: [],
  cartItems: [],
  currentOrder: null,
  currentCustomOrder: null,
  loading: false,
  error: null
};

const pemesananSlice = createSlice({
  name: 'pemesanan',
  initialState,
  reducers: {
    clearPemesananError: (state) => {
      state.error = null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
      state.currentCustomOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all custom and regular orders
      .addCase(fetchAllCustomAndOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomAndOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.customOrders = action.payload.custom_orders || [];
        state.transactions = action.payload.transactions || [];
      })
      .addCase(fetchAllCustomAndOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch active orders
      .addCase(fetchActiveOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrders = action.payload;
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch order history
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get order by unique ID
      .addCase(getOrderByUniqueId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByUniqueId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderByUniqueId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get custom order by ID
      .addCase(getCustomOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomOrder = action.payload;
      })
      .addCase(getCustomOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Other async action handlers follow a similar pattern...
      .addCase(checkoutOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkoutOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkoutOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
      // Add other cases similarly for the remaining async thunks
  }
});

export const { clearPemesananError, resetCurrentOrder } = pemesananSlice.actions;
export default pemesananSlice.reducer;