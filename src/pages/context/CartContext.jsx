import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Initialize items array
      let items = [];

      if (token) {
        // If user is logged in, prioritize backend items
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/itemlist`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("API Response:", response.data);

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
            console.log(
              "Mapped items with IDs:",
              items.map((item) => ({
                id: item.id,
                cartId: item.cartId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching cart from API:", error);
          // If API fails, fall back to localStorage
          const localItems = JSON.parse(localStorage.getItem("cart")) || [];
          items = localItems.map((item) => ({
            ...item,
            cartId: item.cartId || `local-${item.id || Date.now()}`,
          }));
        }
      } else {
        // If user is not logged in, use localStorage only
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        items = localItems.map((item) => ({
          ...item,
          cartId: item.cartId || `local-${item.id || Date.now()}`,
        }));
      }

      // Initialize all items as selected
      const initialSelectedState = {};
      items.forEach((item) => {
        initialSelectedState[item.cartId] = true;
      });

      setSelectedItems(initialSelectedState);
      setCartItems(items);
    } catch (error) {
      console.error("Failed to load cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update cart when component mounts
  useEffect(() => {
    loadCartItems();
  }, []);

  const updateCartCount = () => {
    return cartItems.length;
  };

  const formatPrice = (price) => {
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

  const handleQuantityChange = async (cartId, value) => {
    const newQuantity = Number.parseInt(value) || 1;

    // Update UI immediately for better UX
    const newCartItems = cartItems.map((item) =>
      item.cartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item
    );
    setCartItems(newCartItems);

    // Determine if this is a backend or local item
    const isBackendItem = cartId.startsWith("backend-") && !cartId.includes("temp");

    if (isBackendItem && localStorage.getItem("token")) {
      // If it's a backend item and user is logged in, update via API
      try {
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
      } catch (error) {
        console.error("Failed to update item quantity:", error);
        // Revert UI if API call fails
        loadCartItems();
      }
    } else {
      // For local items, update localStorage
      const localItems = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedLocalItems = localItems.map((item) => {
        const localCartId = item.cartId || `local-${item.id || Date.now()}`;
        return localCartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item;
      });
      localStorage.setItem("cart", JSON.stringify(updatedLocalItems));
    }
  };

  const handleRemoveItem = async (cartId) => {
    // Determine if this is a backend or local item
    const isBackendItem = cartId.startsWith("backend-") && !cartId.includes("temp");

    if (isBackendItem && localStorage.getItem("token")) {
      // If it's a backend item and user is logged in, delete via API
      try {
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
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    } else {
      // For local items, update localStorage
      const localItems = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedLocalItems = localItems.filter((item) => {
        const localCartId = item.cartId || `local-${item.id || Date.now()}`;
        return localCartId !== cartId;
      });
      localStorage.setItem("cart", JSON.stringify(updatedLocalItems));
    }

    // Update UI
    const newCartItems = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(newCartItems);

    // Update selected items state
    const newSelectedItems = { ...selectedItems };
    delete newSelectedItems[cartId];
    setSelectedItems(newSelectedItems);
  };

  const handleSelectItem = (cartId, checked) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cartId]: checked,
    }));
  };

  const handleSelectAll = (checked) => {
    const newSelectedState = {};
    cartItems.forEach((item) => {
      newSelectedState[item.cartId] = checked;
    });
    setSelectedItems(newSelectedState);
  };

  const calculateItemTotal = (item) => {
    const price =
      typeof item.price === "string"
        ? Number.parseFloat(item.price.replace(/[^\d]/g, ""))
        : item.price || item.catalog?.price || 0;
    return price * (item.quantity || item.jumlah || 1);
  };

  const calculateTotal = () => {
    return cartItems
      .filter((item) => selectedItems[item.cartId])
      .reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const getSelectedItemCount = () => {
    return cartItems.filter((item) => selectedItems[item.cartId]).length;
  };

  const areAllSelected = cartItems.length > 0 && cartItems.every((item) => selectedItems[item.cartId]);

  const setNotesValue = (value) => {
    setNotes(value);
  };

  const getSelectedCartItems = () => {
    return cartItems.filter((item) => selectedItems[item.cartId]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItems,
        loading,
        notes,
        loadCartItems,
        updateCartCount,
        formatPrice,
        handleQuantityChange,
        handleRemoveItem,
        handleSelectItem,
        handleSelectAll,
        calculateItemTotal,
        calculateTotal,
        getSelectedItemCount,
        areAllSelected,
        setNotesValue,
        getSelectedCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
