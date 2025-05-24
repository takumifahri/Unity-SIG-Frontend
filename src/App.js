import React, { useEffect } from 'react';
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
import CustomOrders from './pages/cusstomBackup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Footer.css';
import AdminLayout from './components/admin/AdminLayout';
import axios from 'axios';
import PemesananKhusus from './components/PemesananKhusus';
import Pengajuan from './pages/Pengajuan';
import PaymentPage from './pages/PaymentDetail';
import PaymentAdminPage from './pages/admin/PembayaranClient';
import PaymentDetail from './pages/admin/PaymentDetailClient';
import PesananCatalog from './pages/pesananCatalog';
import PesananCustom from './pages/pesananCustom';
import PengajuanPemesanan from './pages/pengajuanPemesanan';
import EditPakaianTable from './components/EditPakaianTabel';
import NotFound from './pages/NotFound';
import OrderDetail from './pages/OrderDetail';
import CustomOrderDetail from './pages/PesananDetail';

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
                        <Route path="/" element={<Layout />}>
                          <Route index element={<Home />} />
                          <Route path="about" element={<About />} />
                          <Route path="akun" element={<Akun />} />
                          <Route path="katalog" element={<Catalog />} />
                          <Route path="tentang-kami" element={<TentangKami />} />
                          <Route path="galeri" element={<Galeri />} />
                          <Route path="contact" element={<ContactUs />} />
                          <Route path="Collection" element={<CategoryPage />} />
                          <Route path="category/:categoryId" element={<CategoryPage />} />
                          <Route path="product/:productId" element={<ProductDetail />} />
                          <Route path="cart" element={<Cart />} />
                          <Route path="ulasan" element={<Ulasan />} />
                          <Route path="checkout" element={<Checkout />} />
                          <Route path="custom-order" element={<CustomOrders />} />
                          <Route path="kontak" element={<Kontak />} />
                          <Route path="lokasi" element={<Lokasi />} />
                          <Route path="orderDetail/:orderUniqueId" element={<OrderDetail />} />
                          <Route path="customOrder/:orderUniqueId" element={<CustomOrderDetail />} />
                          <Route path="payment/:id" element={<PaymentPage />} />

                          {/* 404 Page Route - harus menjadi route terakhir dalam layout */}
                          <Route path="*" element={<NotFound />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin/*" element={<AdminLayout />} >
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="pakaian/tambah" element={<TambahPakaian />} />
                          <Route path="pakaian/edit/:id" element={<EditPakaianTable />} />
                          <Route path="pakaian/tabel" element={<TabelPakaian />} />
                          <Route path="bahan/tambah" element={<TambahBahan />} />
                          <Route path="bahan/tabel" element={<TabelBahan />} />
                          <Route path="pemesanan/semua" element={<Pemesanan />} />
                          <Route path="pemesanan/khusus" element={<PemesananKhusus />} />
                          <Route path="pemesanan/pengajuan" element={<PengajuanPemesanan />} />
                          <Route path="pesanan/:id" element={<AdminPesanan />} />
                          <Route path="pembayaran" element={<PaymentAdminPage />} />
                          <Route path="pembayaran/:id" element={<PaymentDetail />} />
                          <Route path="customOrder/:orderUniqueId" element={< PesananCustom/>} />
                          <Route path="CatalogPesan/:orderUniqueId" element={< PesananCatalog/>} />


                          <Route path="keuangan" element={<Keuangan />} />
                          <Route path="keuangan/pemasukan" element={<KeuanganPemasukan />} />
                          <Route path="keuangan/pengeluaran" element={<KeuanganPengeluaran />} />
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

// Layout component dengan Navbar dan Footer
function Layout() {
  const trackVisitor = async() => {
    try{
      const urlVisited = window.location.pathname;
      axios.post('http://localhost:8000/api/track-visitor', {
        url_visited: urlVisited,
      });

      return null;
    }catch(error){
      console.error("Error tracking visitor:", error);
    }
  }

  useEffect(() => {
    trackVisitor();
  }, []);
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;