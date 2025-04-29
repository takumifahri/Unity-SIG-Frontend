import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome,
    FaUsers,
    FaTshirt,
    FaBoxes,
    FaComments,
    FaSignOutAlt,
    FaShoppingCart
} from 'react-icons/fa';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: FaHome, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: FaUsers, label: 'Users', path: '/admin/users' },
        { icon: FaTshirt, label: 'Produk', path: '/admin/products' },
        { icon: FaBoxes, label: 'Kategori', path: '/admin/categories' },
        { icon: FaShoppingCart, label: 'Pesanan', path: '/admin/orders' },
        { icon: FaComments, label: 'Ulasan', path: '/admin/reviews' },
    ];

    return (
        <div className="w-64 bg-[#7D5A50] text-white h-screen flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[#6d4c42]">
                <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className="flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-[#6d4c42] transition-colors"
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-[#6d4c42] transition-colors border-t border-[#6d4c42] w-full"
            >
                <FaSignOutAlt className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default AdminSidebar; 