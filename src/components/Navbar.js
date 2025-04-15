import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
function NavigationBar() {
  const { cartCount } = useCart();
  const { isAuth } = useAuth();
  const [jenis, setJenis] = useState([]);
  const getMasterKategori = async() =>{
    try{
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master_jenis`, {
        headers: {
          "Content-Type": "application/json",
        }
      }).then(
        (response) => {
          console.log('response', response)
          setJenis(response.data.data);
        }
      ).catch((error) => {
        console.error('Error fetching master kategori:', error);
      }
      )
    } catch(error) {
      console.error('Error fetching master kategori:', error);
    }
  }
  useEffect(() => {
    getMasterKategori();
  },[])
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
              {jenis.map((item) => (
                <NavDropdown.Item key={item.id} as={Link} to={`/category/${item.id}`}>
                  {item.nama_jenis_katalog}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link as={Link} to="/custom-order">Custom Order</Nav.Link>
            <Nav.Link as={Link} to="/kontak">Contact Us</Nav.Link>
            <Nav.Link as={Link} to="/ulasan">Ulasan</Nav.Link>
            {isAuth() ? (
              <>
                <Nav.Link as={Link} to="/akun">
                  <i className="fas fa-user"></i>
                </Nav.Link>
                <Nav.Link as={Link} to="/cart">
                  <i className="fas fa-shopping-cart"></i>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;