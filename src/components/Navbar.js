import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

function NavigationBar() {
  const { cartCount } = useCart();

  return (
    <Navbar bg="white" expand="lg" className="py-3">
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
            </NavDropdown>
            <Nav.Link as={Link} to="/custom-order">Custom Order</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact Us</Nav.Link>
            <Nav.Link as={Link} to="/ulasan">Ulasan</Nav.Link>
            <Nav.Link as={Link} to="/akun">
              <i className="fas fa-user"></i>
            </Nav.Link>
            <Nav.Link as={Link} to="/cart">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;