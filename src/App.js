import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ReviewProvider } from './context/ReviewContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ContactUs from './components/ContactUs';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Ulasan from './pages/Ulasan';
import Checkout from './pages/Checkout';
import Akun from './pages/Akun';
import Login from './pages/Login';
import CustomOrder from './pages/CustomOrder';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Footer.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Kontak from './pages/Kontak';

// Layout Components
import AdminLayout from './components/admin/AdminLayout';
// import Layout from './components/Layout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CatalogManagement from './pages/admin/CatalogManagement';
import MaterialManagement from './pages/admin/MaterialManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import MapIntegration from './pages/admin/MapIntegration';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuth, user } = useAuth();
  
  if (!isAuth() || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ReviewProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="catalog" element={<CatalogManagement />} />
                <Route path="materials" element={<MaterialManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="map" element={<MapIntegration />} />
              </Route>

              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="category/:categoryId" element={<CategoryPage />} />
                <Route path="product/:productId" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="ulasan" element={<Ulasan />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="akun" element={<Akun />} />
                <Route path="custom-order" element={<CustomOrder />} />
                <Route path="kontak" element={<Kontak />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
            </Routes>
          </Router>
        </ReviewProvider>
      </CartProvider>
    </AuthProvider>
  );
}

// Layout component dengan Navbar dan Footer
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This replaces the nested Routes component */}
      <Footer />
    </>
  );
}

export default App;