import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Lokasi() {
  return (
    <Container className="mt-5 pt-5">
      <Row className="mb-5">
        <Col>
          <h2 className="text-center">Lokasi Kami</h2>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <h4>Alamat</h4>
              <p>
                Jl. Contoh No. 123<br />
                Kota, Provinsi<br />
                Kode Pos: 12345
              </p>
              <h4>Kontak</h4>
              <p>
                Telepon: (021) 1234-5678<br />
                WhatsApp: +62 812-3456-7890<br />
                Email: info@konveksi.com
              </p>
              <h4>Jam Operasional</h4>
              <p>
                Senin - Jumat: 08.00 - 17.00<br />
                Sabtu: 08.00 - 15.00<br />
                Minggu: Tutup
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <div className="map-container">
            {/* Ganti src dengan embed map dari Google Maps Anda */}
            <iframe
              src="https://maps.app.goo.gl/78N5TvuJhddxQn8EA"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Konveksi"
            ></iframe>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Lokasi; 