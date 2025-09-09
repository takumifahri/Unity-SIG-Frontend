import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch cart items from API or localStorage
export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      let items = [];

      if (token) {
        // User is logged in, fetch from API
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/itemlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          items = response.data.data.map((order, index) => {
            const catalog = order.catalog || {};
            return {
              ...order,
              cartId: order.id ? `backend-${order.id}` : `backend-temp-${index}`,
              name: catalog.nama_katalog || "Unknown Product",
              price: catalog.price || 0,
              image: catalog.gambar || "",
              quantity: order.jumlah || 1,
              size: order.size || "",
            };
          });
        }
      } else {
        // User not logged in, use localStorage
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        items = localItems.map((item) => ({
          ...item,
          cartId: item.cartId || `local-${item.id || Date.now()}`,
        }));
      }
      
      return items;
    } catch (error) {
      console.error("Error fetching cart:", error);
      
      // Fallback to localStorage
      const localItems = JSON.parse(localStorage.getItem("cart")) || [];
      const items = localItems.map((item) => ({
        ...item,
        cartId: item.cartId || `local-${item.id || Date.now()}`,
      }));
      
      return items;
    }
  }
);

// Update item quantity
export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ cartId, value }, { getState, rejectWithValue }) => {
    try {
      const newQuantity = Number.parseInt(value) || 1;
      const isBackendItem = cartId.startsWith("backend-") && !cartId.includes("temp");
      
      if (isBackendItem && localStorage.getItem("token")) {
        const itemId = cartId.replace("backend-", "");
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/order/addQuantity`,
          { order_id: itemId, jumlah: newQuantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // For local items, update localStorage
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        const updatedLocalItems = localItems.map((item) => {
          const localCartId = item.cartId || `local-${item.id || Date.now()}`;
          return localCartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item;
        });
        localStorage.setItem("cart", JSON.stringify(updatedLocalItems));
      }
      
      return { cartId, newQuantity };
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Remove item from cart
export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (cartId, { rejectWithValue }) => {
    try {
      const isBackendItem = cartId.startsWith("backend-") && !cartId.includes("temp");
      
      if (isBackendItem && localStorage.getItem("token")) {
        const itemId = cartId.replace("backend-", "");
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/order/removeItems`,
          { order_id: itemId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // For local items, update localStorage
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        const updatedLocalItems = localItems.filter((item) => {
          const localCartId = item.cartId || `local-${item.id || Date.now()}`;
          return localCartId !== cartId;
        });
        localStorage.setItem("cart", JSON.stringify(updatedLocalItems));
      }
      
      return cartId;
    } catch (error) {
      console.error("Failed to remove item:", error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  cartItems: [],
  selectedItems: {},
  notes: "",
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    selectItem: (state, action) => {
      const { cartId, checked } = action.payload;
      state.selectedItems[cartId] = checked;
    },
    selectAllItems: (state, action) => {
      const checked = action.payload;
      const newSelectedState = {};
      state.cartItems.forEach((item) => {
        newSelectedState[item.cartId] = checked;
      });
      state.selectedItems = newSelectedState;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        
        // Initialize selected state for all items
        const initialSelectedState = {};
        action.payload.forEach((item) => {
          initialSelectedState[item.cartId] = true;
        });
        state.selectedItems = initialSelectedState;
        
        state.loading = false;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update quantity
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        const { cartId, newQuantity } = action.payload;
        state.cartItems = state.cartItems.map(item =>
          item.cartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item
        );
        state.loading = false;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove item
      .addCase(removeItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        const cartId = action.payload;
        state.cartItems = state.cartItems.filter(item => item.cartId !== cartId);
        delete state.selectedItems[cartId];
        state.loading = false;
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectCartCount = (state) => state.cart.cartItems.length;
export const selectFormattedPrice = (price) => {
  if (!price || price === "RpNaN" || price === "Rp 0") return "Rp 0";
  if (typeof price === "string") {
    price = Number.parseFloat(price.replace(/[^\d]/g, ""));
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("IDR", "Rp");
};

export const selectItemTotal = (item) => {
  const price =
    typeof item.price === "string"
      ? Number.parseFloat(item.price.replace(/[^\d]/g, ""))
      : item.price || item.catalog?.price || 0;
  return price * (item.quantity || item.jumlah || 1);
};

export const selectTotal = (state) => {
  return state.cart.cartItems
    .filter((item) => state.cart.selectedItems[item.cartId])
    .reduce((total, item) => {
      const price =
        typeof item.price === "string"
          ? Number.parseFloat(item.price.replace(/[^\d]/g, ""))
          : item.price || item.catalog?.price || 0;
      return total + price * (item.quantity || item.jumlah || 1);
    }, 0);
};

export const selectSelectedItemCount = (state) => 
  state.cart.cartItems.filter((item) => state.cart.selectedItems[item.cartId]).length;

export const selectAreAllSelected = (state) =>
  state.cart.cartItems.length > 0 && 
  state.cart.cartItems.every((item) => state.cart.selectedItems[item.cartId]);

export const selectSelectedCartItems = (state) =>
  state.cart.cartItems.filter((item) => state.cart.selectedItems[item.cartId]);

export const { selectItem, selectAllItems, setNotes, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;