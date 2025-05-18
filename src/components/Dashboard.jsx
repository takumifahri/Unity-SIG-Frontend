import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );

  const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
      orders: {},
      userCount: 0,
      visitors: {},
      financials: {},
      topUsers: [],
      recentOrders: [],
      topProducts: { labels: [], data: [] }
    });

    // Format currency helper
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Format date helper
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [orderData, userData, visitorData, financeData, topUsersData, recentOrdersData, topProductsData] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/order/monthly`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/users/count`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/users/count/visitor`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/keuangan/ProfitLossMonthly`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/users/topCustomer`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/order`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/catalog/bestSeller`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);
        // Get all orders from response
        const allOrders = recentOrdersData.data.data || [];
        
        // Take only the 5 most recent orders
        const recentOrders = allOrders.slice(0, 5);
        
        setDashboardData({
          orders: orderData.data.data,
          userCount: userData.data.data,
          visitors: visitorData.data.data,
          financials: financeData.data.data,
          topUsers: topUsersData.data.data || [],
          recentOrders: recentOrders,
          topProducts: topProductsData.data.data || { labels: [], data: [] }
        });
      } catch (err) {
        setError('Gagal memuat data dashboard. Silakan coba lagi.');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart data preparation
  const pendapatanData = {
    labels: dashboardData.financials?.labels || [],
    datasets: [
      {
        label: 'Pendapatan',
        data: dashboardData.financials?.datasets?.[0]?.data || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const produkTerlarisData = {
    labels: dashboardData.topProducts.labels || [],
    datasets: [
      {
        data: dashboardData.topProducts.data || [],
        backgroundColor: [
          '#8B4513',  // Brown
          '#2ECC71',  // Green
          '#3498DB',  // Blue
          '#9B59B6',  // Purple
          '#F1C40F'   // Yellow
        ]
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brown-600 mb-2"></div>
          <p>Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }
  
  return (
    <div className="container w-full px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Order Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brown-600">TOTAL ORDER</p>
              <p className="text-sm font-medium text-brown-600">(BULAN INI)</p>
              <h3 className="text-2xl font-bold mt-2">{dashboardData.orders?.current_month_order_count || 0} Pesanan</h3>
            </div>
            <div className="bg-brown-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Pendapatan Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-emerald-600">TOTAL PENDAPATAN</p>
              <p className="text-sm font-medium text-emerald-600">(BULAN INI)</p>
              <h3 className="text-2xl font-bold mt-2">{formatCurrency(dashboardData.orders?.current_month_revenue || 0)}</h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jumlah Akun Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">JUMLAH AKUN</p>
              <p className="text-sm font-medium text-blue-600">TERDAFTAR</p>
              <h3 className="text-2xl font-bold mt-2">{dashboardData.userCount || 0} Akun</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jumlah Pengunjung Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-yellow-600">JUMLAH PENGUNJUNG</p>
              <p className="text-sm font-medium text-yellow-600">WEBSITE</p>
              <h3 className="text-2xl font-bold mt-2">{dashboardData.visitors?.current_month_visitors || 0} Pengunjung</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafik Pendapatan */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Grafik Pendapatan</h3>
          <div className="h-[300px]">
            <Line 
              data={pendapatanData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => formatCurrency(value)
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Produk Terlaris */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-[80%]">
              <Doughnut 
                data={produkTerlarisData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Users by Order Count */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top 5 Pelanggan</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Belanja</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.topUsers.length > 0 ? (
                  dashboardData.topUsers.map((user, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.order_count || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(user.total_spent || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Belum ada data pelanggan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent 5 Orders */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">5 Pesanan Terakhir</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.order_unique_id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user_id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(order.total_harga || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Selesai' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Diproses' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {order.status || 'Menunggu'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      Belum ada data pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Dashboard;