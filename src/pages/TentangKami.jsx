import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function TentangKami() {
  return (
    <Container className="mt-5 pt-5">
      <Row className="mb-5">
        <Col>
          <h2 className="text-center">Tentang Kami</h2>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={6}>
          <img
            src="/tentang/jahit2.jpeg"
            alt="Tentang Kami"
            className="img-fluid rounded"
          />
        </Col>
        <Col md={6}>
          <h3>Sejarah Kami</h3>
          <p>
            Konveksi kami telah berdiri sejak tahun 2010, dengan pengalaman lebih dari 10 tahun
            dalam industri garmen. Kami berkomitmen untuk memberikan layanan terbaik dengan
            hasil produksi yang berkualitas.
          </p>
          <h3>Visi</h3>
          <p>Menjadi konveksi terpercaya dengan kualitas internasional</p>
          <h3>Misi</h3>
          <ul>
            <li>Mengutamakan kepuasan pelanggan</li>
            <li>Menghasilkan produk berkualitas tinggi</li>
            <li>Memberikan pelayanan profesional</li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

export default TentangKami; 