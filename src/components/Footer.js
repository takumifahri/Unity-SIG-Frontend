import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="justify-content-between">
          <Col md={4} className="mb-4 mb-md-0">
            <h5>JR Konveksi</h5>
            <p className="mb-2">
              Konveksi terpercaya dengan kualitas terbaik untuk kebutuhan pakaian Anda.
            </p>
            <div className="social-links">
              <a href="" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                <FaInstagram size={24} />
              </a>
              <a href="" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                <FaWhatsapp size={24} />
              </a>
              <a href="" className="text-light">
                <FaEnvelope size={24} />
              </a>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/category/gamis" className="text-light text-decoration-none">Gamis Series</Link>
              </li>
              <li className="mb-2">
                <Link to="/category/clothes" className="text-light text-decoration-none">Clothes Series</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-light text-decoration-none">Contact Us</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5>Contact Info</h5>
            <p className="mb-1">Jl. Raya Dramaga, Bogor</p>
            <p className="mb-1">WhatsApp: +62 812-XXXX-XXXX</p>
            <p className="mb-1">Email: JR@konveksi.com</p>
            <p>Jam Operasional: Senin - Sabtu (08.00 - 17.00)</p>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} JR Konveksi. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer; 