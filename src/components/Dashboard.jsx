import {useState, useEffect} from 'react';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
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
import { get } from 'jquery';

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
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState([]);
  const [visitor, setVisitor] = useState([]);
  const [money, setMoney] = useState([]);
  const getOrder = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/monthly`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('order masuk : ', res.data.data);
    setOrder(res.data.data);
  }

  const getUser = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/count`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('user masuk : ', res.data.data);
    setUser(res.data.data);
  }

  const getVisitor = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/count/visitor`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('visitor masuk : ', res.data.data);
    setVisitor(res.data.data);
  }

  const getMoney = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/keuangan/ProfitLossMonthly`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('money masuk : ', res.data.data);
    setMoney(res.data.data);
  }
  // Data untuk grafik pendapatan
  const pendapatanData = {
    labels: money?.labels || [],
    datasets: [
      {
        label: 'Pendapatan',
        data: money?.datasets?.[0]?.data.map(value => Math.min(value, 10000000)) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  // Data untuk produk terlaris
  const produkTerlarisData = {
    labels: ['Kemeja Strip', 'Dress', 'Celana'],
    datasets: [
      {
        data: [40, 30, 30],
        backgroundColor: [
          '#8B4513',  // Brown for Kemeja
          '#2ECC71',  // Green for Dress
          '#3498DB'   // Blue for Celana
        ]
      }
    ]
  };

  

  useEffect(() => {
    getOrder();
    getUser();
    getMoney();
    getVisitor();
  }, []);
  
  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Order Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brown-600">TOTAL ORDER</p>
              <p className="text-sm font-medium text-brown-600">(BULAN INI)</p>
              <h3 className="text-2xl font-bold mt-2">{order?.current_month_order_count} Pesanan</h3>
            </div>
            <div className="bg-brown-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Pendapatan Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-emerald-600">TOTAL PENDAPATAN</p>
              <p className="text-sm font-medium text-emerald-600">(BULAN INI)</p>
              <h3 className="text-2xl font-bold mt-2">{order?.current_month_revenue?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jumlah Akun Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">JUMLAH AKUN</p>
              <p className="text-sm font-medium text-blue-600">TERDAFTAR</p>
              <h3 className="text-2xl font-bold mt-2">{user} Akun</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Jumlah Pengunjung Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-yellow-600">JUMLAH PENGUNJUNG</p>
              <p className="text-sm font-medium text-yellow-600">WEBSITE</p>
              <h3 className="text-2xl font-bold mt-2">{visitor?.current_month_visitors} Pengunjung</h3>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Pendapatan */}
        <div className="bg-white p-6 rounded-lg shadow">
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
                      callback: value => `Rp${value.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Produk Terlaris */}
        <div className="bg-white p-6 rounded-lg shadow">
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
    </div>
  );
};

export default Dashboard; 