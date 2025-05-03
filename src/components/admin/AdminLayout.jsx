import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const { isAuth, user } = useAuth();

    // Dummy implementations
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const navigate = (path) => console.log(`Navigating to ${path}`);
    const logout = () => console.log('Logging out');

    // Redirect if not logged in or not an admin
    // if (!isAuth() || user.user?.role !== 'admin' || user.user?.role !== 'owner' || user.user?.role !== 'developer') {
    //     return <Navigate to="/login" replace />;
    // }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-between">
            {/* Sidebar */}
            <AdminSidebar className="w-64" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <div className="bg-white shadow-sm w-full flex justify-end">
                    <div className="flex justify-between items-center px-4 py-4 md:px-8">
                        <div className="profile relative flex items-center space-x-4">
                            <div className="relative">
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    1
                                </span>
                                <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </div>
                            <div
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span className="text-gray-700 text-sm md:text-base">Admin</span>
                                <img
                                    src="/avatar-placeholder.png"
                                    alt="Profile"
                                    className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                                />
                            </div>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                    <ul className="py-1">
                                        <li>
                                            <button
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                onClick={() => navigate('/profile')}
                                            >
                                                Profile
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                onClick={() => logout()}
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 md:p-8 flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 