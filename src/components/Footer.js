// import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { MessageCircle, Phone } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-[#E5D3B7] pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Description */}
        <div className="md:col-span-1">
          <Link href="/" className="text-[#7D5A50] font-script text-2xl flex items-center mb-4">
            <span className="text-3xl mr-1">JR</span>
            <span className="text-sm mt-2">Konveksi</span>
          </Link>
          <p className="text-gray-700 mb-6">
            Menawarkan berbagai produk pakaian berkualitas dengan desain modern dan bahan pilihan, cocok untuk
            kebutuhan sehari-hari, formal, maupun pesanan.
          </p>
          <div className="flex space-x-3">
            <Link href="/chat" className="bg-white p-2 rounded-full">
              <MessageCircle className="h-5 w-5 text-[#7D5A50]" />
            </Link>
            <Link href="/call" className="bg-white p-2 rounded-full">
              <Phone className="h-5 w-5 text-[#7D5A50]" />
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Terbaru dan Terlaris</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/new-arrival" className="text-gray-700 hover:text-[#7D5A50]">
                  New Arrival
                </Link>
              </li>
              <li>
                <Link href="/best-seller" className="text-gray-700 hover:text-[#7D5A50]">
                  Best Seller
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Toko</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/katalog" className="text-gray-700 hover:text-[#7D5A50]">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/pemesanan" className="text-gray-700 hover:text-[#7D5A50]">
                  Pemesanan
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-gray-700 hover:text-[#7D5A50]">
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="text-gray-700 hover:text-[#7D5A50]">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#7D5A50]/20 mt-12 pt-6 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} JR Konveksi. All rights reserved.</p>
      </div>
    </div>
  </footer>
  );
}

export default Footer; 