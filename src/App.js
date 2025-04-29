import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext';
import Kontak from './pages/Kontak';
import Catalog from './pages/Catalog';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ReviewProvider>
          <Router>
            <Routes>
              {/* Route untuk Login tanpa Navbar dan Footer */}
              <Route path="/login" element={<Login />} />

              {/* Route lainnya dengan Layout (Navbar dan Footer) */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="akun" element={<Akun />} />
                <Route path="catalog" element={<Catalog />} />

                <Route path="contact" element={<ContactUs />} />
                <Route path="Collection" element={<CategoryPage />} />
                <Route path="category/:categoryId" element={<CategoryPage />} />
                <Route path="product/:productId" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="ulasan" element={<Ulasan />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="custom-order" element={<CustomOrder />} />
                <Route path="kontak" element={<Kontak />} />
              </Route>
            </Routes>
          </Router>
        </ReviewProvider>
      </CartProvider>
    </AuthProvider>
  );
}

// Layout component dengan Navbar dan Footer
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This replaces the nested Routes component */}
      <Footer />
    </>
  );
}

export default App;