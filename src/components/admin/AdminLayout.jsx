import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaUsers, FaTshirt, FaFabric, FaList, FaMap, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const { Logout, user } = useAuth();

  const handleLogout = () => {
    Logout();
    navigate('/login');
  };

  // Protect admin routes
  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h3>Admin Panel</h3>
        </div>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/admin/dashboard">
            <FaHome /> Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/users">
            <FaUsers /> Manajemen User
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/catalog">
            <FaTshirt /> Katalog
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/materials">
            <FaFabric /> Bahan Kain
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/categories">
            <FaList /> Kategori
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/map">
            <FaMap /> Peta QGIS
          </Nav.Link>
          <Nav.Link onClick={handleLogout} className="mt-auto">
            <FaSignOutAlt /> Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <Container fluid>
          <Outlet />
        </Container>
      </div>
    </div>
  );
}

export default AdminLayout; 