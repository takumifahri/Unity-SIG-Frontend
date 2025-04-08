import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';
import { useCart } from '../context/CartContext';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [notes, setNotes] = useState('');
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    // Memastikan setiap item memiliki ID unik
    const itemsWithUniqueIds = items.map((item, index) => ({
      ...item,
      cartId: item.cartId || `${item.id}-${Date.now()}-${index}`
    }));
    setCartItems(itemsWithUniqueIds);
    localStorage.setItem('cart', JSON.stringify(itemsWithUniqueIds));
    
    // Hitung total
    const sum = itemsWithUniqueIds.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
    localStorage.setItem('cartTotal', sum.toString());
  };

  const formatPrice = (price) => {
    if (!price || price === 'RpNaN' || price === 'Rp 0') return 'Rp 0';
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d]/g, ''));
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp');
  };

  const handleQuantityChange = (cartId, value) => {
    const newQuantity = parseInt(value) || 1;
    const newCartItems = cartItems.map(item => 
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(newCartItems);
    localStorage.setItem('cart', JSON.stringify(newCartItems));
  };

  const handleRemoveItem = (cartId) => {
    const newCartItems = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(newCartItems);
    localStorage.setItem('cart', JSON.stringify(newCartItems));
    updateCartCount();
  };

  const calculateItemTotal = (item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/[^\d]/g, '')) 
      : (item.price || 0);
    return price * (item.quantity || 1);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      ...product,
      cartId: `${product.id}-${Date.now()}`,
      price: parseFloat(product.price) || 0,
      quantity: parseInt(product.quantity) || 1
    };

    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const newCart = [...currentCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  return (
    <Container className="cart-container py-5">
      <h2 className="cart-title mb-4">Keranjang</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Keranjang belanja Anda kosong</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/category/gamis')}
            className="start-shopping-btn"
          >
            Mulai Belanja
          </Button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Desktop Header - Hidden on Mobile */}
          <div className="cart-header d-none d-md-grid">
            <div className="product-col">Produk</div>
            <div className="price-col">Harga</div>
            <div className="quantity-col">Kuantitas</div>
            <div className="total-col">Total</div>
            <div className="action-col"></div>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.cartId} className="cart-item">
                <div className="product-info">
                  <div className="product-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="placeholder-image"></div>
                    )}
                  </div>
                  <div className="product-details">
                    <h6>{item.name || item.productName}</h6>
                    <p className="text-muted mb-2">Ukuran: {item.size}</p>
                    {/* Mobile Price - Shown only on mobile */}
                    <p className="product-price d-md-none">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                {/* Desktop Price - Hidden on Mobile */}
                <div className="price-display d-none d-md-block">
                  {formatPrice(item.price)}
                </div>

                <div className="quantity-section">
                  <span className="quantity-label d-md-none">Jumlah:</span>
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
                      className="quantity-input"
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <span className="total-label d-md-none">Total:</span>
                  {formatPrice(calculateItemTotal(item))}
                </div>

                <div className="item-action">
                  <Button 
                    variant="link" 
                    className="delete-btn"
                    onClick={() => handleRemoveItem(item.cartId)}
                    aria-label="Hapus item"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-notes">
              <Form.Group>
                <Form.Label>Catatan Pesanan</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Masukkan catatan untuk pesanan Anda"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="cart-summary">
              <div className="summary-content">
                <div className="summary-row">
                  <span>Total ({cartItems.length} item):</span>
                  <span className="summary-amount">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="checkout-button"
                onClick={handleCheckout}
              >
                Pembayaran
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Cart; 