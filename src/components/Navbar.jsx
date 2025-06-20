import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Person } from '@mui/icons-material';

function NavigationBar() {
  const { cartCount } = useCart();
  const { isAuth } = useAuth();
  const [jenis, setJenis] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation(); // Hook untuk mendapatkan lokasi saat ini
  
  const getMasterKategori = async() => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master_jenis`, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      console.log('response', response);
      setJenis(response.data.data);
    } catch(error) {
      console.error('Error fetching master kategori:', error);
    }
  }
  
  useEffect(() => {
    getMasterKategori();
  }, []);
  
  // Fungsi untuk menentukan apakah link aktif atau tidak
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implementasi pencarian (redirect ke halaman hasil pencarian)
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#7D5A50] py-4 px-4 md:px-8">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-white font-script text-2xl flex items-center">
            <img src="/logo2.png" alt="Logo" className="h-11 mr-2" />
          </Link>

          {/* Search Bar */}
          <form 
            className="hidden md:flex relative bg-white rounded-xl flex-grow max-w-md mx-4"
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 px-4 pr-10 rounded-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <FaSearch className="text-gray-500" />
            </button>
          </form>

          <div className="flex items-center space-x-4">
            {isAuth() ? (
              <>
                <Link to="/cart" className="text-white relative flex">
                  <FaShoppingCart className="text-3xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/akun" className="text-white">
                  <Person style={{ fontSize: '2.5rem' }} />
                </Link>
              </>
            ) : (
              <Link to="/login" className="text-white">
                <button className="bg-[#7D5A50] hover:bg-[#6D4A40] text-white px-4 py-2 rounded-md border border-white">
                  Login
                </button>
              </Link>
            )}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <nav className="bg-white shadow">
        <div className="container mx-auto">
          <ul
            className={`md:flex justify-center space-x-8 py-4 ${
              isMenuOpen ? "block" : "hidden md:flex"
            }`}
          >
            <li className="relative group px-2 py-2 md:py-0">
              <Link
                to="/Katalog"
                className={`font-medium transition-colors no-underline text-black hover:text-[#7D5A50] ${
                  isActive('/Katalog') ? 'border-b-2 border-[#7D5A50] pb-1 text-[#7D5A50]' : ''
                }`}
              >
                Katalog
              </Link>
              <ul className="absolute left-0 mt-2 bg-white shadow-lg rounded-md hidden group-hover:block min-w-[150px] z-10">
                {jenis.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/category/${item.id}`}
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors no-underline text-black"
                    >
                      {item.namaJenisKatalog}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="px-2 py-2 md:py-0">
              <Link
                to="/custom-order"
                className={`font-medium transition-colors no-underline text-black hover:text-[#7D5A50] ${
                  isActive('/custom-order') ? 'border-b-2 border-[#7D5A50] pb-1 text-[#7D5A50]' : ''
                }`}
              >
                Pemesanan
              </Link>
            </li>
            {/* <li className="px-2 py-2 md:py-0">
              <Link
                to="/galeri"
                className={`font-medium transition-colors no-underline text-black hover:text-[#7D5A50] ${
                  isActive('/galeri') ? 'border-b-2 border-[#7D5A50] pb-1 text-[#7D5A50]' : ''
                }`}
              >
                Galeri
              </Link>
            </li> */}
            <li className="px-2 py-2 md:py-0">
              <Link
                to="/tentang-kami"
                className={`font-medium transition-colors no-underline text-black hover:text-[#7D5A50] ${
                  isActive('/tentang-kami') ? 'border-b-2 border-[#7D5A50] pb-1 text-[#7D5A50]' : ''
                }`}
              >
                Tentang Kami
              </Link>
            </li>
            <li className="px-2 py-2 md:py-0">
              <Link
                to="/kontak"
                className={`font-medium transition-colors no-underline text-black hover:text-[#7D5A50] ${
                  isActive('/kontak') ? 'border-b-2 border-[#7D5A50] pb-1 text-[#7D5A50]' : ''
                }`}
              >
                Kontak
              </Link>
            </li>
            <li className="px-2 py-2 md:py-0">
              <Link
                to="/ulasan"
                className={`font-medium transition-colors no-underline text-black hover:text-[#7D5A50] ${
                  isActive('/ulasan') ? 'border-b-2 border-[#7D5A50] pb-1 text-[#7D5A50]' : ''
                }`}
              >
                Ulasan
              </Link>
            </li>
          </ul>

          {/* Mobile Search */}
          <form
            className={`md:hidden px-4 pb-4 ${
              isMenuOpen ? "block" : "hidden"
            }`}
            onSubmit={handleSearchSubmit}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pr-10 rounded-full border focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <FaSearch className="text-gray-500" />
              </button>
            </div>
          </form>
        </div>
      </nav>
    </header>
  );
}

export default NavigationBar;