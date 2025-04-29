import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaTshirt, FaStar } from 'react-icons/fa';
import axios from 'axios';
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
import { Line, Bar } from 'react-chartjs-2';

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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageRating: 0,
  });

  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });

  const [productStats, setProductStats] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics
        const statsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`);
        setStats(statsResponse.data);

        // Fetch sales data
        const salesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/sales`);
        setSalesData({
          labels: salesResponse.data.labels,
          datasets: [{
            label: 'Penjualan',
            data: salesResponse.data.data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          }],
        });

        // Fetch product statistics
        const productResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products/stats`);
        setProductStats({
          labels: productResponse.data.labels,
          datasets: [{
            label: 'Produk Terjual',
            data: productResponse.data.data,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }],
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Dummy data - replace with real data from your API
  const statsData = [
    { icon: FaUsers, label: 'Total Users', value: stats.totalUsers },
    { icon: FaShoppingCart, label: 'Total Orders', value: stats.totalOrders },
    { icon: FaTshirt, label: 'Products', value: stats.totalProducts },
    { icon: FaStar, label: 'Reviews', value: stats.averageRating.toFixed(1) },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <stat.icon className="w-8 h-8 text-[#7D5A50]" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {/* Replace with actual recent activities */}
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">New Order #1234</p>
              <p className="text-sm text-gray-600">2 items - Rp 500.000</p>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">New User Registration</p>
              <p className="text-sm text-gray-600">john.doe@example.com</p>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">New Review</p>
              <p className="text-sm text-gray-600">5 stars - "Great service!"</p>
            </div>
            <span className="text-sm text-gray-500">3 hours ago</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <Row className="g-4">
        <Col md={8}>
          <Card className="p-4">
            <h4>Grafik Penjualan</h4>
            <Line 
              data={salesData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Penjualan Bulanan'
                  }
                }
              }}
            />
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4">
            <h4>Produk Terlaris</h4>
            <Bar 
              data={productStats}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Top 5 Produk'
                  }
                }
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 