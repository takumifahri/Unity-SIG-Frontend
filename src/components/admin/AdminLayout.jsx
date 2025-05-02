import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const { isAuth, user } = useAuth();

    // Redirect if not logged in or not an admin
    if (!isAuth() || user.user?.role !== 'admin' || user.user?.role !== 'owner' || user.user?.role !== 'developer') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Top Navigation */}
                <nav className="bg-white shadow-sm px-6 py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">{user?.email}</span>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 