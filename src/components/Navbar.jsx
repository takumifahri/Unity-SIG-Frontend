import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
function NavigationBar() {
  const { cartCount } = useCart();
  const { isAuth } = useAuth();
  const [jenis, setJenis] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const getMasterKategori = async() =>{
    try{
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master_jenis`, {
        headers: {
          "Content-Type": "application/json",
        }
      }).then(
        (response) => {
          console.log('response', response)
          setJenis(response.data.data);
        }
      ).catch((error) => {
        console.error('Error fetching master kategori:', error);
      }
      )
    } catch(error) {
      console.error('Error fetching master kategori:', error);
    }
  }
  useEffect(() => {
    getMasterKategori();
  },[])
  return (
    <header>
      {/* Top Bar */}
      <div className="bg-[#7D5A50] py-4 px-4 md:px-8">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-white font-script text-2xl flex items-center">
            <span className="text-3xl mr-1">JR</span>
            <span className="text-sm mt-2">Konveksi</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex relative bg-white rounded-xl flex-grow max-w-md mx-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 px-4 pr-10 rounded-full focus:outline-none"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <i className="fas fa-search text-gray-500"></i>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {isAuth() ? (
              <>
                <Link to="/cart" className="text-white relative flex">
                    <FaShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                    <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {cartCount}
                    </span>
                    )}
                </Link>
                <Link to="/akun" className="text-white">
                  <i className="fas fa-user h-6 w-6"></i>
                </Link>
              </>
            ) : (
              <Link to="/login" className="text-white">
                <button className="bg-[#7D5A50] text-white px-4 py-2 rounded-md">
                  Login
                </button>
              </Link>
            )}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <i className="fas fa-times h-6 w-6"></i>
              ) : (
                <i className="fas fa-bars h-6 w-6"></i>
              )}
            </button>
          </div>

          </div>
          </div>
          <nav className="bg-white shadow">
            <div className="container mx-auto">
              <ul
                className={`md:flex justify-center space-x-8 py-4 ${
                  isMenuOpen ? "block" : "hidden"
                }`}
              >
                <li className="relative group">
                  <Link
                    to="/Catalog"
                    className="font-medium hover:text-[#7D5A50] transition-colors no-underline text-black"
                  >
                    Katalog
                  </Link>
                  <ul className="absolute left-0 mt-2 bg-white shadow-lg rounded-md hidden group-hover:block">
                    {jenis.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/category/${item.id}`}
                          className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          {item.namaJenisKatalog}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <Link
                    to="/custom-order"
                    className="font-medium hover:text-[#7D5A50] transition-colors no-underline text-black"
                  >
                    Pemesanan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/galeri"
                    className="font-medium hover:text-[#7D5A50] transition-colors no-underline  text-black"
                  >
                    Galeri
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tentang-kami"
                    className="font-medium hover:text-[#7D5A50] transition-colors no-underline  text-black"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    to="/kontak"
                    className="font-medium hover:text-[#7D5A50] transition-colors no-underline text-black"
                  >
                    Kontak
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ulasan"
                    className="font-medium hover:text-[#7D5A50] transition-colors no-underline text-black"
                  >
                    Ulasan
                  </Link>
                </li>
              </ul>

              {/* Mobile Search */}
          <div
            className={`md:hidden px-4 pb-4 ${
              isMenuOpen ? "block" : "hidden"
            }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pr-10 rounded-full border focus:outline-none"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <i className="fas fa-search text-gray-500"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavigationBar;