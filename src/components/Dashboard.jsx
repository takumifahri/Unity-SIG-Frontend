import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Loading states for individual sections
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);
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

  // Fetch all dashboard data with separate loading states
  const fetchDashboardData = async () => {
    // Start all loading states
    setLoadingStats(true);
    setLoadingCharts(true);
    setLoadingTables(true);
    setError(null);
    
    try {
      // Fetch stats data (for cards)
      const fetchStats = async () => {
        try {
          const [orderData, userData, visitorData, financeData] = await Promise.all([
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
            })
          ]);
          
          setDashboardData(prev => ({
            ...prev,
            orders: orderData.data.data,
            userCount: userData.data.data,
            visitors: visitorData.data.data,
            financials: financeData.data.data
          }));
        } catch (error) {
          console.error('Error fetching stats data:', error);
          setError('Gagal memuat data statistik');
        } finally {
          setLoadingStats(false);
        }
      };
      
      // Fetch chart data
      const fetchCharts = async () => {
        try {
          const topProductsData = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog/bestSeller`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          setDashboardData(prev => ({
            ...prev,
            topProducts: topProductsData.data.data || { labels: [], data: [] }
          }));
        } catch (error) {
          console.error('Error fetching chart data:', error);
          setError('Gagal memuat data grafik');
        } finally {
          setLoadingCharts(false);
        }
      };
      
      // Fetch table data
      const fetchTables = async () => {
        try {
          const [topUsersData, recentOrdersData] = await Promise.all([
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
            })
          ]);
          
          // Get all orders from response
          const allOrders = recentOrdersData.data.data || [];
          
          // Take only the 5 most recent orders
          const recentOrders = allOrders.slice(0, 5);
          
          setDashboardData(prev => ({
            ...prev,
            topUsers: topUsersData.data.data || [],
            recentOrders: recentOrders
          }));
        } catch (error) {
          console.error('Error fetching table data:', error);
          setError('Gagal memuat data tabel');
        } finally {
          setLoadingTables(false);
        }
      };
      
      // Execute all fetch functions in parallel
      await Promise.all([fetchStats(), fetchCharts(), fetchTables()]);
    } catch (err) {
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
      console.error('Dashboard data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart data preparation for income
  const pendapatanData = {
    labels: dashboardData.financials?.labels || [],
    datasets: [
      {
        label: 'Pemasukan',
        data: dashboardData.financials?.datasets?.[0]?.data || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  // Get current month's income from financial data
  const getCurrentMonthIncome = () => {
    if (!dashboardData.financials?.monthly_details) return 0;
    
    const currentMonth = new Date().getMonth(); // 0-indexed (0 = January)
    const monthData = dashboardData.financials.monthly_details.find(m => m.month_number === currentMonth + 1);
    return monthData ? monthData.profit_loss : 0;
  };

  // Prepare top products data for bar chart
  const prepareTopProductsBarData = () => {
    if (!dashboardData.topProducts || !dashboardData.topProducts.labels || dashboardData.topProducts.labels.length === 0) {
      return {
        labels: ['Belum ada data'],
        datasets: [{
          data: [0],
          backgroundColor: ['#8B4513'],
        }]
      };
    }

    // Get top 3 products only
    const top3Labels = dashboardData.topProducts.labels.slice(0, 3);
    const top3Data = dashboardData.topProducts.data.slice(0, 3);
    
    // Reorder to put #1 in the middle, #2 on the right, #3 on the left
    let orderedLabels = [];
    let orderedData = [];
    let orderedColors = [];
    
    if (top3Labels.length === 3) {
      // If we have 3 products: #3, #1, #2
      orderedLabels = [top3Labels[2], top3Labels[0], top3Labels[1]];
      orderedData = [top3Data[2], top3Data[0], top3Data[1]];
      orderedColors = ['#9B59B6', '#8B4513', '#2ECC71']; // Purple, Brown, Green
    } else if (top3Labels.length === 2) {
      // If we have 2 products: #1, #2
      orderedLabels = [top3Labels[0], top3Labels[1]];
      orderedData = [top3Data[0], top3Data[1]];
      orderedColors = ['#8B4513', '#2ECC71']; // Brown, Green
    } else if (top3Labels.length === 1) {
      // If we have 1 product: just #1
      orderedLabels = [top3Labels[0]];
      orderedData = [top3Data[0]];
      orderedColors = ['#8B4513']; // Brown
    }
    
    return {
      labels: orderedLabels,
      datasets: [{
        data: orderedData,
        backgroundColor: orderedColors,
        maxBarThickness: 100
      }]
    };
  };

  const topProductsBarData = prepareTopProductsBarData();

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
          {loadingStats ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-36 mt-4"></div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Total Pendapatan Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          {loadingStats ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-36 mt-4"></div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600">TOTAL PENDAPATAN</p>
                <p className="text-sm font-medium text-emerald-600">(BULAN INI)</p>
                <h3 className={`text-xl font-bold mt-2 ${getCurrentMonthIncome() < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(getCurrentMonthIncome())}
                  {getCurrentMonthIncome() < 0 && 
                    <span className="ml-1 text-sm">(Defisit)</span>
                  }
                </h3>
                {dashboardData.financials?.summary?.summaary === 0 && 
                  <p className="text-xs text-gray-500 mt-1">Belum ada pemasukan tercatat</p>
                }
              </div>
              <div className={`${getCurrentMonthIncome() < 0 ? 'bg-red-100' : 'bg-emerald-100'} p-3 rounded-lg`}>
                <svg className={`w-6 h-6 ${getCurrentMonthIncome() < 0 ? 'text-red-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Jumlah Akun Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          {loadingStats ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-36 mt-4"></div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Jumlah Pengunjung Card */}
        <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
          {loadingStats ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-36 mt-4"></div>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafik Pendapatan */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Grafik Pendapatan</h3>
          <div className="h-[300px] flex items-center justify-center">
            {loadingCharts ? (
              <div className="animate-pulse w-full">
                <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
                <div className="h-40 bg-gray-100 rounded w-full"></div>
              </div>
            ) : dashboardData.financials?.datasets?.[0]?.data.every(value => value === 0) ? (
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Belum ada data pendapatan yang tercatat.</p>
                <p className="text-sm mt-1">Grafik akan ditampilkan setelah ada transaksi pemasukan.</p>
              </div>
            ) : (
              <Line 
                data={pendapatanData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      ticks: {
                        callback: value => formatCurrency(value)
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Produk Terlaris (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
          <div className="h-[300px] flex items-center justify-center">
            {loadingCharts ? (
              <div className="animate-pulse w-full">
                <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
                <div className="h-40 bg-gray-100 rounded w-full"></div>
              </div>
            ) : dashboardData.topProducts.labels?.length === 0 ? (
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p>Belum ada data produk terlaris.</p>
                <p className="text-sm mt-1">Data akan muncul setelah ada transaksi.</p>
              </div>
            ) : (
              <Bar 
                data={topProductsBarData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y', // Horizontal bar chart
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          label += context.formattedValue + ' pcs';
                          return label;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        precision: 0 // Only show integer values
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Additional Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Users by Order Count */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top 5 Pelanggan</h3>
          <div className="overflow-x-auto">
            {loadingTables ? (
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
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.total_order || 0}</td>
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
            )}
          </div>
        </div>

        {/* Recent 5 Orders */}
        <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4">5 Pesanan Terakhir</h3>
          <div className="overflow-x-auto">
            {loadingTables ? (
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
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user?.name || 'N/A'}</td>
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
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center gap-2"
          disabled={loadingStats || loadingCharts || loadingTables}
        >
          {(loadingStats || loadingCharts || loadingTables) ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;