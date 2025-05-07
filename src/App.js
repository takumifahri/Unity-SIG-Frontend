import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ReviewProvider } from './context/ReviewContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PakaianProvider } from './context/PakaianContext';
import { BahanProvider } from './context/BahanContext';
import { PemesananProvider } from './context/PemesananContext';
import { PesananProvider } from './context/PesananContext';
import { KeuanganProvider } from './context/KeuanganContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import About from './pages/About';
import Akun from './pages/Akun';
import Catalog from './pages/Catalog';
import TentangKami from './pages/TentangKami';
import Galeri from './pages/Galeri';
import ContactUs from './components/ContactUs';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Ulasan from './pages/Ulasan';
import Checkout from './pages/Checkout';
import CustomOrder from './pages/CustomOrder';
import Kontak from './pages/Kontak';
import Lokasi from './pages/Lokasi';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './components/Dashboard';
import TambahPakaian from './components/TambahPakaian';
import TabelPakaian from './components/TabelPakaian';
import TambahBahan from './components/TambahBahan';
import TabelBahan from './components/TabelBahan';
import Pemesanan from './components/Pemesanan';
import AdminPesanan from './components/AdminPesanan';
import Keuangan from './components/Keuangan';
import KeuanganPemasukan from './components/KeuanganPemasukan';
import KeuanganPengeluaran from './components/KeuanganPengeluaran';
import CustomerDistribution from './components/CustomerDistribution';
import AkunTerdaftar from './components/AkunTerdaftar';
import PesananCatalog from './pages/admin/PesananCatalog';
import PesananCustom from './pages/admin/PesananCustom';
import Pakaian from './pages/admin/Pakaian';
import Bahan from './pages/admin/Bahan';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Footer.css';
import AdminLayout from './components/admin/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ReviewProvider>
          <PakaianProvider>
            <BahanProvider>
              <PemesananProvider>
                <PesananProvider>
                  <KeuanganProvider>
                    <Router>
                      <Routes>
                        {/* Routes tanpa Navbar dan Footer */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Routes dengan Layout (Navbar dan Footer) */}
                        <Route path="/" element={<>
                          <Navbar />
                          <Outlet />
                          <Footer />
                        </>}>
                          <Route index element={<Home />} />
                          <Route path="about" element={<About />} />
                          <Route path="akun" element={<Akun />} />
                          <Route path="catalog" element={<Catalog />} />
                          <Route path="tentang-kami" element={<TentangKami />} />
                          <Route path="galeri" element={<Galeri />} />
                          <Route path="contact" element={<ContactUs />} />
                          <Route path="Collection" element={<CategoryPage />} />
                          <Route path="category/:categoryId" element={<CategoryPage />} />
                          <Route path="product/:productId" element={<ProductDetail />} />
                          <Route path="cart" element={<Cart />} />
                          <Route path="ulasan" element={<Ulasan />} />
                          <Route path="checkout" element={<Checkout />} />
                          <Route path="custom-order" element={<CustomOrder />} />
                          <Route path="kontak" element={<Kontak />} />
                          <Route path="lokasi" element={<Lokasi />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<Dashboard />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="pakaian" element={<Pakaian />} />
                          <Route path="bahan" element={<Bahan />} />
                          <Route path="pemesanan/catalog" element={<PesananCatalog />} />
                          <Route path="pemesanan/custom" element={<PesananCustom />} />
                          <Route path="keuangan" element={<Keuangan />} />
                          <Route path="sebaran-pelanggan" element={<CustomerDistribution />} />
                          <Route path="akun-terdaftar" element={<AkunTerdaftar />} />
                        </Route>
                      </Routes>
                    </Router>
                  </KeuanganProvider>
                </PesananProvider>
              </PemesananProvider>
            </BahanProvider>
          </PakaianProvider>
        </ReviewProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;