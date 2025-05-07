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
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="fixed left-0 top-0">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Page Content */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 