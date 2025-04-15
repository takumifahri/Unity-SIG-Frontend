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

function Dashboard() {
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

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="icon">
              <FaUsers />
            </div>
            <h4>Total Users</h4>
            <h3>{stats.totalUsers}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="icon">
              <FaShoppingCart />
            </div>
            <h4>Total Orders</h4>
            <h3>{stats.totalOrders}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="icon">
              <FaTshirt />
            </div>
            <h4>Total Products</h4>
            <h3>{stats.totalProducts}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="icon">
              <FaStar />
            </div>
            <h4>Average Rating</h4>
            <h3>{stats.averageRating.toFixed(1)}</h3>
          </Card>
        </Col>
      </Row>

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
}

export default Dashboard; 