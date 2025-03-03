import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Tentang Kami</h5>
            <p>Konveksi terpercaya dengan kualitas terbaik untuk kebutuhan pakaian Anda.</p>
          </Col>
          <Col md={4}>
            <h5>Kontak</h5>
            <p>Email: JR@konveksi.com</p>
            <p>Telepon: (021) 1234-5678</p>
            <p>Alamat: Jalan Contoh No. 123, Jakarta</p>
          </Col>
          <Col md={4}>
            <h5>Sosial Media</h5>
            <div>
              <a href="#" className="text-light me-3">Instagram</a>
              <a href="#" className="text-light me-3">Facebook</a>
              <a href="#" className="text-light">WhatsApp</a>
            </div>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="mb-0">&copy; 2024 Konveksi Website. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;