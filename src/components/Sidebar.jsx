import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard,
  MdCheckroom,
  MdInventory,
  MdShoppingCart,
  MdAttachMoney,
  MdLocationOn,
  MdPeople,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight
} from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({
    pakaian: false,
    bahan: false,
    keuangan: false
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <MdDashboard size={20} />,
      title: 'Dashboard'
    },
    {
      title: 'Pakaian',
      icon: <MdCheckroom size={20} />,
      hasSubmenu: true,
      submenuKey: 'pakaian',
      submenuItems: [
        { path: '/pakaian/tambah', title: 'Tambah Pakaian' },
        { path: '/pakaian/tabel', title: 'Tabel Pakaian' }
      ]
    },
    {
      title: 'Bahan',
      icon: <MdInventory size={20} />,
      hasSubmenu: true,
      submenuKey: '/admin/bahan',
      submenuItems: [
        { path: '/admin/bahan/tambah', title: 'Tambah Bahan' },
        { path: '/bahan/tabel', title: 'Tabel Bahan' }
      ]
    },
    {
      path: '/pemesanan',
      icon: <MdShoppingCart size={20} />,
      title: 'Pemesanan'
    },
    {
      title: 'Keuangan',
      icon: <MdAttachMoney size={20} />,
      hasSubmenu: true,
      submenuKey: '/admin/keuangan',
      submenuItems: [
        { path: '/admin/keuangan/pemasukan', title: 'Pemasukan' },
        { path: '/admin/keuangan/pengeluaran', title: 'Pengeluaran' }
      ]
    },
    {
      path: '/admin/sebaran-pelanggan',
      icon: <MdLocationOn size={20} />,
      title: 'Sebaran Pelanggan'
    },
    {
      path: '/admin/akun-terdaftar',
      icon: <MdPeople size={20} />,
      title: 'Akun Terdaftar'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#5D4037] text-white shadow-lg overflow-y-auto">
      {/* Logo dan Judul */}
      <div className="p-6 border-b border-[#795548]">
        <h1 className="text-2xl font-bold tracking-wider">JR Konveksi</h1>
      </div>

      {/* Menu Items */}
      <nav className="mt-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.hasSubmenu ? (
              // Menu dengan submenu
              <div>
                <button
                  onClick={() => toggleSubmenu(item.submenuKey)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200 
                    ${isActive(item.path) ? 'bg-[#3E2723] text-white' : 'text-gray-300 hover:bg-[#4E342E] hover:text-white'}`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-6">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {openSubmenus[item.submenuKey] ? 
                    <MdKeyboardArrowDown size={20} /> : 
                    <MdKeyboardArrowRight size={20} />
                  }
                </button>
                {/* Submenu */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  openSubmenus[item.submenuKey] ? 'max-h-40' : 'max-h-0'
                }`}>
                  {item.submenuItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`flex items-center pl-16 pr-6 py-2 text-sm transition-colors duration-200
                        ${isActive(subItem.path) ? 'bg-[#3E2723] text-white' : 'text-gray-300 hover:bg-[#4E342E] hover:text-white'}`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              // Menu tanpa submenu
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm transition-colors duration-200 
                  ${isActive(item.path) ? 'bg-[#3E2723] text-white' : 'text-gray-300 hover:bg-[#4E342E] hover:text-white'}`}
              >
                <div className="flex items-center space-x-4">
                  <span className="w-6">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-8 p-4 text-center text-sm text-gray-400 border-t border-[#795548]">
        <p>© JR Konveksi 2024</p>
      </div>
    </div>
  );
};

export default Sidebar; 