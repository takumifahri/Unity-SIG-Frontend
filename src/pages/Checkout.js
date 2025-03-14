import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const shippingCost = 20000; // Ongkos kirim
  const applicationFee = 2500; // Biaya aplikasi

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'transfer'
  });

  useEffect(() => {
    try {
      // Ambil data cart dari localStorage
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(items);
      
      // Hitung subtotal dengan memastikan nilai numerik
      const calculatedSubtotal = items.reduce((total, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        return total + (itemPrice * itemQuantity);
      }, 0);
      
      setSubtotal(calculatedSubtotal);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setSubtotal(0);
    }
  }, []);

  // Hitung total dengan memastikan semua nilai adalah numerik
  const calculateTotal = () => {
    const numericSubtotal = parseFloat(subtotal) || 0;
    const numericShipping = parseFloat(shippingCost) || 0;
    const numericFee = parseFloat(applicationFee) || 0;
    return numericSubtotal + numericShipping + numericFee;
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return `Rp ${numericPrice.toLocaleString('id-ID')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Pembayaran berhasil!');
    localStorage.removeItem('cart');
    localStorage.removeItem('cartTotal');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Checkout</h2>
      <Row>
        <Col md={8}>
          <Form onSubmit={handleSubmit}>
            {/* Informasi Pengiriman */}
            <div className="checkout-section mb-4">
              <h4>Informasi Pengiriman</h4>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nama Lengkap</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>No. Telepon</Form.Label>
                    <Form.Control 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Alamat Lengkap</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>
            </div>

            {/* Detail Pesanan */}
            <div className="checkout-section mb-4">
              <h4>Detail Pesanan</h4>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const itemPrice = parseFloat(item.price) || 0;
                    const itemQuantity = parseInt(item.quantity) || 0;
                    const itemTotal = itemPrice * itemQuantity;

                    return (
                      <tr key={item.cartId}>
                        <td>{item.name}</td>
                        <td>{formatPrice(itemPrice)}</td>
                        <td>{itemQuantity}</td>
                        <td>{formatPrice(itemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Metode Pembayaran */}
            <div className="checkout-section mb-4">
              <h4>Metode Pembayaran</h4>
              <Form.Group>
                <Form.Check
                  type="radio"
                  label="Transfer Bank"
                  name="paymentMethod"
                  id="transfer"
                  value="transfer"
                  checked={formData.paymentMethod === 'transfer'}
                  onChange={handleChange}
                />
                <Form.Check
                  type="radio"
                  label="E-Wallet"
                  name="paymentMethod"
                  id="ewallet"
                  value="ewallet"
                  checked={formData.paymentMethod === 'ewallet'}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </Form>
        </Col>

        {/* Ringkasan Pembayaran */}
        <Col md={4}>
          <div className="payment-summary">
            <h4>Ringkasan Pembayaran</h4>
            <div className="summary-item">
              <span>Subtotal Produk</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-item">
              <span>Ongkos Kirim</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="summary-item">
              <span>Biaya Aplikasi</span>
              <span>{formatPrice(applicationFee)}</span>
            </div>
            <hr />
            <div className="summary-item total">
              <span>Total Pembayaran</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            <Button 
              variant="primary" 
              className="w-100 mt-3"
              onClick={handleSubmit}
            >
              Bayar Sekarang
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout; 