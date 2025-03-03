import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Beranda from './pages/Beranda';
import TentangKami from './pages/TentangKami';
import Ulasan from './pages/Ulasan';
import Lokasi from './pages/Lokasi';
import Footer from './components/Footer';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';

function App() {
  return (
    <CartProvider>
      <div className="d-flex flex-column min-vh-100">
        <Router>
          <NavigationBar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Beranda />} />
              <Route path="/tentang" element={<TentangKami />} />
              <Route path="/Collection" element={<CategoryPage />} />
              <Route path="/ulasan" element={<Ulasan />} />
              <Route path="/lokasi" element={<Lokasi />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
        </Router>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App; 