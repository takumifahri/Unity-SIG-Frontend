import React, { useEffect, useState } from "react";
import "../styles/HalamanProduk.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/logo.png"; // Pastikan file logo ada

function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/products?section=New Arrivals")
      .then((res) => res.json())
      .then((data) => setNewArrivals(data));
    fetch("http://localhost:8000/api/products?section=Best Seller")
      .then((res) => res.json())
      .then((data) => setBestSellers(data));
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-jr py-0">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img src={logo} alt="JR Konveksi" className="logo-img me-2" />
          </a>
          <form className="d-flex search-bar mx-auto" role="search">
            <input className="form-control" type="search" placeholder="Search" aria-label="Search" />
          </form>
          <div className="d-flex align-items-center nav-icons">
            <a href="#" className="me-3"><i className="bi bi-cart"></i></a>
            <a href="#"><i className="bi bi-person"></i></a>
          </div>
        </div>
      </nav>

      {/* Submenu */}
      <div className="submenu">
        <ul className="nav justify-content-center">
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Katalog</a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Pakaian</a></li>
              <li><a className="dropdown-item" href="#">Bahan</a></li>
            </ul>
          </li>
          <li className="nav-item"><a className="nav-link" href="#">Pemesanan</a></li>
          <li className="nav-item"><a className="nav-link" href="#">Galeri</a></li>
          <li className="nav-item"><a className="nav-link" href="#">Tentang Kami</a></li>
          <li className="nav-item"><a className="nav-link" href="#">Kontak</a></li>
        </ul>
      </div>

      {/* Carousel */}
      <div className="container my-4">
        <div className="carousel-box position-relative">
          <button className="carousel-arrow carousel-arrow-left"><i className="bi bi-chevron-left"></i></button>
          <div className="carousel-placeholder"></div>
          <button className="carousel-arrow carousel-arrow-right"><i className="bi bi-chevron-right"></i></button>
          <div className="carousel-indicators-custom">
            <span className="indicator active"></span>
            <span className="indicator"></span>
            <span className="indicator"></span>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="container">
        <h2 className="section-title">New Arrivals</h2>
        <div className="row g-4">
          {(newArrivals.length ? newArrivals : Array(8).fill({})).map((product, idx) => (
            <div className="col-6 col-md-3" key={product.id || idx}>
              <div className="product-card">
                <div className="product-img" style={product.image ? { backgroundImage: `url(${product.image})` } : {}}></div>
                <div className="product-title">{product.title || "Heading 4"}</div>
                <div className="product-subtitle">{product.subtitle || "Heading 6"}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center my-4">
          <button className="btn btn-lihat-semua">Lihat Semua</button>
        </div>
      </div>

      {/* Best Seller */}
      <div className="container">
        <h2 className="section-title">Best Seller</h2>
        <div className="row g-4">
          {(bestSellers.length ? bestSellers : Array(4).fill({})).map((product, idx) => (
            <div className="col-6 col-md-3" key={product.id || idx}>
              <div className="product-card">
                <div className="product-img" style={product.image ? { backgroundImage: `url(${product.image})` } : {}}></div>
                <div className="product-title">{product.title || "Heading 4"}</div>
                <div className="product-subtitle">{product.subtitle || "Heading 6"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer mt-5">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-5 mb-4 mb-md-0">
              <div className="logo-jr mb-2">
                <img src={logo} alt="JR Konveksi" className="logo-img" />
              </div>
              <p className="footer-desc">
                Menawarkan berbagai produk pakaian berkualitas dengan desain modern dan bahan pilihan, cocok untuk kebutuhan sehari-hari, formal, maupun pesanan.
              </p>
              <div className="footer-icons">
                <span className="circle-bg"><i className="bi bi-chat-dots"></i></span>
                <span className="circle-bg"><i className="bi bi-telephone"></i></span>
              </div>
            </div>
            <div className="col-6 col-md-3 mb-4 mb-md-0">
              <div className="footer-title">Terbaru dan Terlaris</div>
              <ul className="footer-list">
                <li>New Arrival</li>
                <li>Best Seller</li>
              </ul>
            </div>
            <div className="col-6 col-md-4">
              <div className="footer-title">Toko</div>
              <ul className="footer-list">
                <li>Katalog</li>
                <li>Pemesanan</li>
                <li>Galeri</li>
                <li>Tentang Kami</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
