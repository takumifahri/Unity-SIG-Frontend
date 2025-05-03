import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    // FaHome,
    // FaUsers,
    // FaTshirt,
    // FaBoxes,
    // FaComments,
    // FaSignOutAlt,
    FaShoppingCart,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';
import { 
  MdDashboard,
  MdCheckroom,
  MdInventory,
  MdShoppingCart,
  MdAttachMoney,
  MdLocationOn,
  MdPeople,
//   MdKeyboardArrowDown,
//   MdKeyboardArrowRight
} from 'react-icons/md';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [openSubmenus, setOpenSubmenus] = useState({});

    const toggleSubmenu = (menu) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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
           { path: '/admin/pakaian/tambah', title: 'Tambah Pakaian' },
           { path: '/admin/pakaian/tabel', title: 'Tabel Pakaian' }
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

    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-[100dvh] left-0 top-0 w-64 bg-[#5D4037] text-white shadow-lg overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#795548]">
                <h1 className="text-2xl font-bold tracking-wider">Admin Panel</h1>
            </div>

            {/* Menu Items */}
            <nav className="mt-4 flex-grow">
                {menuItems.map((item, index) => (
                    <div key={index}>
                        {item.hasSubmenu ? (
                            // Menu with submenu
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
                                    {openSubmenus[item.submenuKey] ? (
                                        <FaChevronDown size={16} />
                                    ) : (
                                        <FaChevronRight size={16} />
                                    )}
                                </button>
                                {/* Submenu */}
                                <div
                                    className={`transition-all duration-300 overflow-hidden ${
                                        openSubmenus[item.submenuKey] ? 'max-h-40' : 'max-h-0'
                                    }`}
                                >
                                    {item.submenuItems.map((subItem, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            to={subItem.path}
                                            className={`flex items-center pl-16 pr-6 py-2 text-sm transition-colors duration-200
                                                ${
                                                    isActive(subItem.path)
                                                        ? 'bg-[#3E2723] text-white'
                                                        : 'text-gray-300 hover:bg-[#4E342E] hover:text-white'
                                                }`}
                                        >
                                            {subItem.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Menu without submenu
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

            {/* Logout Button */}
            {/* <button
                onClick={handleLogout}
                className="w-full flex items-center px-6 py-3 text-sm transition-colors duration-200 text-gray-300 hover:bg-[#4E342E] hover:text-white border-t border-[#795548]"
            >
                <FaSignOutAlt size={20} className="mr-4" />
                <span className="font-medium">Logout</span>
            </button> */}

            {/* Footer */}
            <div className="pt-4 text-center text-sm text-gray-400 border-t border-[#795548]">
                <p>© Admin Panel 2024</p>
            </div>
        </div>
    );
};

export default AdminSidebar;