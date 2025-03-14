import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useReview } from '../context/ReviewContext';
import { useNavigate } from 'react-router-dom';

function ContactUs() {
  const { addReview } = useReview();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    rating: '',
    ulasan: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Tambahkan review baru
    addReview({
      nama: formData.nama,
      rating: parseInt(formData.rating),
      ulasan: formData.ulasan
    });

    // Reset form
    setFormData({
      nama: '',
      email: '',
      telepon: '',
      rating: '',
      ulasan: ''
    });

    // Tampilkan alert sukses
    setShowAlert(true);

    // Redirect ke halaman ulasan setelah 2 detik
    setTimeout(() => {
      navigate('/ulasan');
    }, 2000);
  };

  return (
    <section id="contact" className="py-5">
      <Container>
        <h2 className="text-center mb-4">Contact Us</h2>
        
        {showAlert && (
          <Alert 
            variant="success" 
            onClose={() => setShowAlert(false)} 
            dismissible
            className="mb-4"
          >
            Terima kasih atas ulasan Anda! Mengalihkan ke halaman ulasan...
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <Card className="p-4 mb-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telepon</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="1">⭐ (1)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ulasan</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="ulasan"
                    value={formData.ulasan}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Kirim
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Informasi Kontak dan Lokasi */}
          <Col md={6}>
            <Card className="p-4">
              <h4>JR Konveksi</h4>
              <p>
                <strong>Alamat:</strong><br />
                Jl. Raya Dramaga, Bogor<br /><br />
                <strong>Jam Operasional:</strong><br />
                Senin - Jumat: 08.00 - 17.00<br />
                Sabtu: 08.00 - 15.00<br />
                Minggu: Tutup<br /><br />
                <strong>Kontak:</strong><br />
                WhatsApp: +62 812-XXXX-XXXX<br />
                Email: JR@konveksi.com
              </p>
              <div className="mt-3">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.729046039927!2d106.7291066!3d-6.5607899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c4b758d5c1b5%3A0x89b0802179c78bdf!2sInstitut%20Pertanian%20Bogor!5e0!3m2!1sid!2sid!4v1709865283044!5m2!1sid!2sid"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="lokasi"
                ></iframe>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default ContactUs; 