import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState({
    name: 'Admin',
    email: 'admin@jrkonveksi.com',
    role: 'Administrator',
    avatar: '/avatar-placeholder.png'
  });

  // Fungsi untuk mengambil notifikasi dari API/backend
  const fetchNotifications = async () => {
    try {
      // Simulasi API call
      const mockNotifications = [
        {
          id: 1,
          message: 'Ada pesanan baru dari pelanggan',
          time: '5 menit yang lalu',
          isRead: false,
          type: 'order',
          link: '/admin/pesanan'
        },
        {
          id: 2,
          message: 'Pembayaran berhasil diterima',
          time: '1 jam yang lalu',
          isRead: false,
          type: 'payment',
          link: '/keuangan'
        },
        {
          id: 3,
          message: 'Stok bahan kain menipis',
          time: '2 jam yang lalu',
          isRead: true,
          type: 'inventory',
          link: '/bahan/tabel'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fungsi untuk menandai notifikasi sebagai telah dibaca
  const markNotificationAsRead = async (notifId) => {
    try {
      // Simulasi API call untuk update status notifikasi
      setNotifications(notifications.map(notif => 
        notif.id === notifId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fungsi untuk menangani klik pada notifikasi
  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    setShowNotifications(false);
    navigate(notification.link);
  };

  // Fungsi untuk menandai semua notifikasi sebagai telah dibaca
  const markAllAsRead = async () => {
    try {
      // Simulasi API call untuk update semua notifikasi
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Fungsi untuk logout
  const handleLogout = async () => {
    try {
      // Simulasi API call untuk logout
      localStorage.removeItem('token'); // Hapus token dari localStorage
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Fungsi untuk mengambil data profil dari API/backend
  const fetchProfile = async () => {
    try {
      // Simulasi API call untuk mendapatkan data profil
      const mockProfile = {
        name: 'Admin',
        email: 'admin@jrkonveksi.com',
        role: 'Administrator',
        avatar: '/avatar-placeholder.png'
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Effect untuk mengambil data saat komponen dimount
  useEffect(() => {
    fetchNotifications();
    fetchProfile();
  }, []);

  // Hitung jumlah notifikasi yang belum dibaca
  const unreadNotifications = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-end items-center px-8 py-4">
        <div className="flex items-center space-x-4">
          {/* Notifikasi */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-brown-600 hover:bg-brown-50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brown-400 focus:ring-opacity-50"
            >
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Dropdown Notifikasi */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 transform transition-all duration-300 ease-in-out">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700">Notifikasi</h3>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brown-600 hover:text-brown-700"
                    >
                      Tandai semua sudah dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full px-4 py-3 hover:bg-brown-50 flex items-start transition-colors duration-200 ${
                          !notif.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold' : ''}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Tidak ada notifikasi
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 focus:outline-none group"
            >
              <span className="text-gray-700 group-hover:text-brown-600 transition-colors duration-200">
                {profile.name}
              </span>
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-brown-400 transition-all duration-300"
              />
            </button>

            {/* Dropdown Profil */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 transform transition-all duration-300 ease-in-out">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">{profile.name}</p>
                  <p className="text-xs text-gray-500">{profile.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-600 transition-colors duration-200"
                >
                  Profil Saya
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-brown-50 hover:text-brown-600 transition-colors duration-200"
                >
                  Pengaturan
                </button>
                <div className="border-t border-gray-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 