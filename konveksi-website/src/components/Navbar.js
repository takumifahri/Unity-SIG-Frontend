import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

function NavigationBar() {
  const { cartCount } = useCart();

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm" style={{ zIndex: 1000 }}>
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.png"
            width="50"
            height="50"
            alt="JR Konveksi"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <NavDropdown title="Collection" id="collection-dropdown">
              <NavDropdown.Item as={Link} to="/category/gamis">
                GAMIS SERIES
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/category/tiama">
                CLOTHES SERIES
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/category/akhwat">
                KNITWARE
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/category/hijab">
                HIJAB COLLECTION
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/tentang">Tentang Kami</Nav.Link>
            <Nav.Link as={Link} to="/ulasan">Ulasan</Nav.Link>
            <Nav.Link as={Link} to="/lokasi">Lokasi</Nav.Link>
            <Nav.Link as={Link} to="/akun">
              <i className="fas fa-user"></i>
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" className="position-relative">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;