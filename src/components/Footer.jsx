"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Phone, Instagram, Mail, MapPin, ArrowRight, Facebook, Twitter, Youtube } from "lucide-react"

function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      // Here you would typically send this to your API
      console.log("Subscribing email:", email)
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 3000)
      setEmail("")
    }
  }

  return (
    <footer className="relative bg-gradient-to-br from-[#E5D3B7] to-[#D8C3A5] pt-16 pb-8 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7D5A50] via-[#B98B73] to-[#7D5A50]"></div>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#7D5A50]/5 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7D5A50]/5 -ml-40 -mb-40"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6 group">
              <div className="flex items-center">
                <div className="bg-[#7D5A50] text-white rounded-lg w-12 h-12 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="font-script text-2xl">JR</span>
                </div>
                <div className="ml-3">
                  <span className="text-[#7D5A50] font-bold text-xl block leading-tight">JR Konveksi</span>
                  <span className="text-[#7D5A50]/70 text-xs">Quality Clothing Manufacturer</span>
                </div>
              </div>
            </Link>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Menawarkan berbagai produk pakaian berkualitas dengan desain modern dan bahan pilihan, cocok untuk
              kebutuhan sehari-hari, formal, maupun pesanan khusus.
            </p>

            <div className="flex space-x-3 mb-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <Instagram className="h-5 w-5 text-[#7D5A50]" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <Facebook className="h-5 w-5 text-[#7D5A50]" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <Twitter className="h-5 w-5 text-[#7D5A50]" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <Youtube className="h-5 w-5 text-[#7D5A50]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-5 text-[#7D5A50] border-b border-[#7D5A50]/20 pb-2">Produk Populer</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/new-arrival" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  New Arrival
                </Link>
              </li>
              <li>
                <Link to="/best-seller" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Best Seller
                </Link>
              </li>
              <li>
                <Link to="/custom-order" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Custom Order
                </Link>
              </li>
              <li>
                <Link to="/promo" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Promo Spesial
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-5 text-[#7D5A50] border-b border-[#7D5A50]/20 pb-2">Toko Kami</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/Catalog" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Katalog
                </Link>
              </li>
              <li>
                <Link to="/custom-order" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Pemesanan
                </Link>
              </li>
              <li>
                <Link to="/galeri" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Galeri
                </Link>
              </li>
              <li>
                <Link to="/tentang-kami" className="text-gray-700 hover:text-[#7D5A50] flex items-center group">
                  <span className="w-1.5 h-1.5 bg-[#7D5A50] rounded-full mr-2 group-hover:w-3 transition-all duration-300"></span>
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-5 text-[#7D5A50] border-b border-[#7D5A50]/20 pb-2">Hubungi Kami</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-[#7D5A50] mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">Jl. Konveksi No. 123, Kota Jahit, Indonesia 12345</p>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 text-[#7D5A50] mr-3 flex-shrink-0" />
                <a href="tel:+6281234567890" className="text-gray-700 hover:text-[#7D5A50]">
                  +62 812-3456-7890
                </a>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-[#7D5A50] mr-3 flex-shrink-0" />
                <a href="mailto:info@jrkonveksi.com" className="text-gray-700 hover:text-[#7D5A50]">
                  info@jrkonveksi.com
                </a>
              </div>
            </div>

            <h4 className="font-semibold text-[#7D5A50] mb-3">Berlangganan Newsletter</h4>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Anda"
                className="w-full px-4 py-2 pr-10 rounded-lg border border-[#7D5A50]/30 focus:outline-none focus:ring-2 focus:ring-[#7D5A50]/50"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7D5A50] hover:text-[#5D3A30] transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
            {subscribed && (
              <p className="text-green-600 text-sm mt-2 animate-pulse">Terima kasih telah berlangganan!</p>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 py-6 border-t border-b border-[#7D5A50]/20 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#7D5A50]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center">Pembayaran Aman</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#7D5A50]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center">Kualitas Terjamin</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#7D5A50]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center">Berbagai Metode Pembayaran</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#7D5A50]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center">Pengiriman Cepat</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-600">
          <p className="mb-2">&copy; {new Date().getFullYear()} JR Konveksi. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/privacy-policy" className="text-gray-600 hover:text-[#7D5A50]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-[#7D5A50]">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-[#7D5A50]">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
