import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard,
  MdShoppingCart,
  MdAttachMoney,
  MdLocationOn,
  MdPeople,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdInventory2,
  MdCheckroom
} from 'react-icons/md';

const AdminSidebar = () => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <MdDashboard size={20} />,
      title: 'Dashboard'
    },
    {
      path: '/admin/pakaian',
      icon: <MdCheckroom size={20} />,
      title: 'Pakaian'
    },
    {
      path: '/admin/bahan',
      icon: <MdInventory2 size={20} />,
      title: 'Bahan'
    },
    {
      type: 'dropdown',
      icon: <MdShoppingCart size={20} />,
      title: 'Pemesanan',
      isOpen: isOrderOpen,
      toggle: () => setIsOrderOpen(!isOrderOpen),
      children: [
        {
          path: '/admin/pemesanan/catalog',
          title: 'Pesanan Catalog'
        },
        {
          path: '/admin/pemesanan/custom',
          title: 'Pesanan Custom'
        }
      ]
    },
    {
      path: '/admin/keuangan',
      icon: <MdAttachMoney size={20} />,
      title: 'Keuangan'
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
    if (path === '/admin/pemesanan/catalog' || path === '/admin/pemesanan/custom') {
      return location.pathname === path;
    }
    return location.pathname === path;
  };

  return (
    <div className="h-[100dvh] left-0 top-0 w-64 bg-[#5D4037] text-white shadow-lg overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#795548]">
        <h1 className="text-2xl font-bold tracking-wider">JR Konveksi</h1>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 flex-grow">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.type === 'dropdown' ? (
              <div className="mb-2">
                <button
                  onClick={item.toggle}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200 
                    ${location.pathname.includes('/admin/pemesanan') ? 'bg-[#3E2723] text-white' : 'text-gray-300 hover:bg-[#4E342E] hover:text-white'}`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-6">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.isOpen ? <MdKeyboardArrowUp size={20} /> : <MdKeyboardArrowDown size={20} />}
                </button>
                {item.isOpen && (
                  <div className="ml-4">
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className={`flex items-center pl-12 pr-6 py-3 text-sm transition-colors duration-200
                          ${isActive(child.path) ? 'bg-[#3E2723] text-white' : 'text-gray-300 hover:bg-[#4E342E] hover:text-white'}`}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
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
      <div className="pt-4 pb-4 text-center text-sm text-gray-400 border-t border-[#795548]">
        <p>© JR Konveksi 2025</p>
      </div>
    </div>
  );
};

export default AdminSidebar;