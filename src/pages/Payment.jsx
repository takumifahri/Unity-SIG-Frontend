import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Payment.css';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState({
    orderNumber: `ORD${Date.now()}`,
    amount: 0,
    paymentMethod: '',
    status: 'pending'
  });
  const [orderDetails, setOrderDetails] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    // Get payment details from checkout
    const total = localStorage.getItem('cartTotal');
    const paymentMethod = localStorage.getItem('paymentMethod');
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (!total || !paymentMethod) {
      navigate('/checkout');
      return;
    }

    setPaymentData(prev => ({
      ...prev,
      amount: parseFloat(total),
      paymentMethod
    }));

    setOrderDetails(cartItems);
  }, [navigate]);

  const getBankDetails = () => {
    switch(paymentData.paymentMethod) {
      case 'transfer':
        return {
          bankName: 'Bank BCA',
          accountNumber: '1234567890',
          accountName: 'PT Unity SIG'
        };
      case 'ewallet':
        return {
          type: 'QRIS',
          code: 'Scan QR code below'
        };
      default:
        return null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
    // In a real application, you would handle the payment confirmation here
    setTimeout(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('paymentMethod');
      navigate('/');
    }, 3000);
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Pembayaran</h2>

      {/* Order Details Section */}
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="order-details-card">
            <Card.Body>
              <h4 className="mb-3">Detail Pesanan</h4>
              {orderDetails.length > 0 ? (
                <ul className="list-group">
                  {orderDetails.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Tidak ada detail pesanan ditemukan.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Section */}
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="payment-card mb-4">
            <Card.Body>
              <h4 className="mb-3">Detail Pembayaran</h4>
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1"><strong>Nomor Order:</strong></p>
                  <p>{paymentData.orderNumber}</p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Total Pembayaran:</strong></p>
                  <p className="text-primary">{formatPrice(paymentData.amount)}</p>
                </Col>
              </Row>

              <div className="payment-instructions mt-4">
                <h5>Instruksi Pembayaran</h5>
                {paymentData.paymentMethod === 'transfer' && (
                  <div>
                    <p><strong>Transfer ke rekening berikut:</strong></p>
                    <p>Bank: {getBankDetails().bankName}</p>
                    <p>No. Rekening: {getBankDetails().accountNumber}</p>
                    <p>Atas Nama: {getBankDetails().accountName}</p>
                  </div>
                )}
                {paymentData.paymentMethod === 'ewallet' && (
                  <div>
                    <p><strong>{getBankDetails().type}</strong></p>
                    <p>{getBankDetails().code}</p>
                    {/* Add QR Code image here */}
                  </div>
                )}
              </div>

              <Form onSubmit={handleConfirmPayment} className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label>Upload Bukti Pembayaran</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={handleFileUpload}
                    required
                    accept="image/*"
                  />
                  <Form.Text className="text-muted">
                    Format yang diterima: JPG, PNG, PDF (max 2MB)
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mt-3"
                  disabled={!uploadedFile || showConfirmation}
                >
                  Konfirmasi Pembayaran
                </Button>
              </Form>

              {showConfirmation && (
                <Alert variant="success" className="mt-3">
                  Pembayaran berhasil dikonfirmasi! Anda akan dialihkan ke halaman utama...
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Payment;