import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';

const PemesananContext = createContext();

export const PemesananProvider = ({ children }) => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customOrders, setCustomOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  
  const token = localStorage.getItem('token');
  
  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPesanan(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllCustomAndOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/all`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setPesanan(response.data.data.orders);
      setCustomOrders(response.data.data.custom_orders);
      setTransactions(response.data.data.transactions);
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all orders and custom orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
      return { orders: [], custom_orders: [], transactions: [] };
    } finally {
      setLoading(false);
    }
  };
  
  const fetchActiveOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/tracking`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setActiveOrders(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching active orders:", error);
      setError(error.response?.data?.message || "Failed to fetch active orders");
      return { orders: [], custom_orders: [] };
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrderHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/history`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setOrderHistory(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError(error.response?.data?.message || "Failed to fetch order history");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/itemlist`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCartItems(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setError(error.response?.data?.message || "Failed to fetch cart items");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/show/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error.response?.data?.message || "Failed to fetch order details");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const addToCart = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/additem`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh cart data after adding
      await fetchCartItems();
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError(error.response?.data?.message || "Failed to add item to cart");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const removeFromCart = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/order/removeItem`,
        {
          data: { order_id: orderId },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh cart data after removing
      await fetchCartItems();
      return response.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError(error.response?.data?.message || "Failed to remove item from cart");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateQuantity = async (orderId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/addQuantity`,
        { 
          order_id: orderId,
          jumlah: quantity 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh cart data after update
      await fetchCartItems();
      return response.data;
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError(error.response?.data?.message || "Failed to update quantity");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const checkout = async (checkoutData) => {
    setLoading(true);
    setError(null);
    try {
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
      
      // Refresh cart and active orders after checkout
      await fetchCartItems();
      await fetchActiveOrders();
      return response.data;
    } catch (error) {
      console.error("Error during checkout:", error);
      setError(error.response?.data?.message || "Failed to complete checkout");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const uploadPaymentProof = async (transactionId, buktiPembayaran) => {
    setLoading(true);
    setError(null);
    try {
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
      
      // Refresh active orders after upload
      await fetchActiveOrders();
      return response.data;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      setError(error.response?.data?.message || "Failed to upload payment proof");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const recievedUser = async (orderId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
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
      
      // Refresh orders data
      await fetchAllCustomAndOrders();
      return response.data;
    } catch (error) {
      console.error("Error confirming delivery receipt:", error);
      setError(error.response?.data?.message || "Failed to confirm delivery receipt");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Admin functions
  const adminVerifyPayment = async (orderId, status, reason = null) => {
    try {
      setLoading(true);
      
      const data = {
        status: status,
      };
      
      // Add reason if provided (for rejection)
      if (reason && status === 'reject') {
        data.reason = reason;
      }
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/order/admin/verif/${orderId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const sendToDelivery = async (orderId, deliveryData) => {
    setLoading(true);
    setError(null);
    try {
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
      await fetchAllCustomAndOrders();
      return response.data;
    } catch (error) {
      console.error("Error sending to delivery:", error);
      setError(error.response?.data?.message || "Failed to send to delivery");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const completeOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/complete/${orderId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh orders after completion
      await fetchAllCustomAndOrders();
      return response.data;
    } catch (error) {
      console.error("Error completing order:", error);
      setError(error.response?.data?.message || "Failed to complete order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/deliveryStatus`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching delivery status:", error);
      setError(error.response?.data?.message || "Failed to fetch delivery status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Custom Order Functions
  const fetchCustomOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/custom`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCustomOrders(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      setError(error.response?.data?.message || "Failed to fetch custom orders");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomOrderDetails = async (customOrderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/custom/show/${customOrderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching custom order details:", error);
      setError(error.response?.data?.message || "Failed to fetch custom order details");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const proposeCustomOrder = async (customOrderData) => {
    setLoading(true);
    setError(null);
    try {
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
      
      // Refresh custom orders after proposing
      await fetchCustomOrders();
      return response.data;
    } catch (error) {
      console.error("Error proposing custom order:", error);
      setError(error.response?.data?.message || "Failed to propose custom order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptCustomOrder = async (acceptData) => {
    setLoading(true);
    setError(null);
    try {
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
      
      // Refresh custom orders after accepting
      await fetchCustomOrders();
      return response.data;
    } catch (error) {
      console.error("Error accepting custom order:", error);
      setError(error.response?.data?.message || "Failed to accept custom order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const finalizeCustomOrder = async (customOrderId, statusData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/finalize/${customOrderId}`,
        statusData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh custom orders after finalizing
      await fetchCustomOrders();
      return response.data;
    } catch (error) {
      console.error("Error finalizing custom order:", error);
      setError(error.response?.data?.message || "Failed to finalize custom order");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Add token debugging to getOrderByUniqueId
  const getOrderByUniqueId = async (orderUniqueId) => {
    setLoading(true);
    setError(null);
    
    if (!orderUniqueId) {
      setError('Order ID is required');
      setLoading(false);
      throw new Error('Order ID is required');
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Debug token
      console.log("Auth token (first 10 chars):", token ? token.substring(0, 10) + "..." : "No token");
      console.log("Fetching order with ID:", orderUniqueId);
      
      // If no token, throw error
      if (!token) {
        throw new Error("No authentication token found");
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
      
      console.log('data order unique id', response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching order by unique ID:", err);
      setError(err.response?.data?.message || 'Failed to fetch order details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCustomOrderById = async (orderUniqueId) => {
    setLoading(true);
    setError(null);
    
    if (!orderUniqueId) {
      setError('Order ID is required');
      setLoading(false);
      throw new Error('Order ID is required');
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Debug token
      console.log("Auth token (first 10 chars):", token ? token.substring(0, 10) + "..." : "No token");
      console.log("Fetching order with ID:", orderUniqueId);
      
      // If no token, throw error
      if (!token) {
        throw new Error("No authentication token found");
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
      
      console.log('data order unique id', response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching order by unique ID:", err);
      setError(err.response?.data?.message || 'Failed to fetch order details');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders and cart on mount if token exists
  useEffect(() => {
    if (token) {
      fetchAllOrders();
      fetchCartItems();
    }
  }, [token]);
  
  return (
    <PemesananContext.Provider value={{
      pesanan,
      customOrders,
      transactions,
      activeOrders,
      orderHistory,
      cartItems,
      loading,
      error,
      
      // Fetch functions
      fetchAllOrders,
      fetchAllCustomAndOrders,
      fetchActiveOrders,
      fetchOrderHistory,
      fetchCartItems,
      fetchOrderDetails,
      
      // User operations
      addToCart,
      removeFromCart,
      updateQuantity,
      checkout,
      uploadPaymentProof,
      
      // Admin operations
      adminVerifyPayment,
      sendToDelivery,
      completeOrder,
      getDeliveryStatus,
      recievedUser,
      getOrderByUniqueId,
      getCustomOrderById,
      
      // Custom order operations
      fetchCustomOrders,
      fetchCustomOrderDetails,
      proposeCustomOrder,
      acceptCustomOrder,
      finalizeCustomOrder
    }}>
      {children}
    </PemesananContext.Provider>
  );
};

export const usePemesanan = () => useContext(PemesananContext);