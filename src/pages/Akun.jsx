import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
function Akun() {
  const navigate = useNavigate();
  const { user, isAuth, Logout, token, loading } = useAuth();
  
  // Check if user is logged in
  useEffect(() => {
    if (!loading && (!isAuth() || !token)) {
      navigate('/login');
    }
  }, [isAuth, navigate, token, loading]);

  const [userInfo, setUserInfo] = useState({
    nama: '',
    email: '',
    telepon: '',
    gender: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State untuk feedback
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  // State untuk mode edit dan temporary data
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({...userInfo});

  // Update user info when auth user changes
  useEffect(() => {
    if (user) {
      console.log("User data received:", user);
      setUserInfo({
        nama: user.user.name || '',
        email: user.user.email || '',
        telepon: user.user.phone || '',
        gender: user.user.gender || ''
      });
      setTempUserInfo({
        nama: user.user.name || '',
        email: user.user.email || '',
        telepon: user.user.phone || '',
        gender: user.user.gender || ''
      });
    }
  }, [user]);

  // State untuk validasi password
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false
  });

  // State untuk visibility toggle
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Contoh data pesanan (nanti bisa diambil dari API/database)
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
  
    if (token) {
      // Simpan token ke localStorage atau ke AuthContext
      localStorage.setItem('token', token);
      
      // Misalnya pakai context
      // setToken(token);
      // fetchUser(); // jika perlu refresh user info
  
      // Bersihkan token dari URL agar tidak terlihat
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    // Simpan token ke localStorage atau ke AuthContext
    localStorage.setItem('token', token);
    
    // Misalnya pakai context
    // setToken(token);
    // fetchUser(); // jika perlu refresh user info

    // Bersihkan token dari URL agar tidak terlihat
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}, []);
  // Fetch order history
  useEffect(() => {
  }, [token]);

  // Validasi email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validasi nomor telepon
  const validatePhone = (phone) => {
    if (!phone) return true; // Allow empty phone for now
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Jika sedang dalam mode edit dan klik batal, kembalikan ke data asli
      setTempUserInfo({...userInfo});
    }
    setIsEditing(!isEditing);
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!tempUserInfo.nama.trim()) {
      setFeedback({
        type: 'danger',
        message: 'Nama tidak boleh kosong'
      });
      return;
    }

    // Validasi email
    if (!validateEmail(tempUserInfo.email)) {
      setFeedback({
        type: 'danger',
        message: 'Format email tidak valid'
      });
      return;
    }

    if (tempUserInfo.telepon && !validatePhone(tempUserInfo.telepon)) {
      setFeedback({
        type: 'danger',
        message: 'Format nomor telepon tidak valid'
      });
      return;
    }

    try {
      // Make API call to update user data
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/profile`, 
        {
          name: tempUserInfo.nama,
          email: tempUserInfo.email,
          phone: tempUserInfo.telepon,
          gender: tempUserInfo.gender
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update userInfo with temporary data
      setUserInfo({...tempUserInfo});
      
      setFeedback({
        type: 'success',
        message: 'Informasi akun berhasil diperbarui!'
      });

      // Nonaktifkan mode edit
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Gagal memperbarui informasi akun!'
      });
    }

    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const validatePasswordRules = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password)
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validasi semua rules terpenuhi
    const allRulesMet = Object.values(passwordValidation).every(rule => rule);
    
    if (!allRulesMet) {
      setFeedback({
        type: 'danger',
        message: 'Password harus memenuhi semua kriteria'
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setFeedback({
        type: 'danger',
        message: 'Password baru tidak cocok!'
      });
      return;
    }

    try {
      // Make API call to update password
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/change-password`, 
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
          new_password_confirmation: passwords.confirmPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setFeedback({
        type: 'success',
        message: 'Password berhasil diubah!'
      });

      // Reset form dan feedback
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordValidation({
        length: false,
        number: false,
        uppercase: false,
        lowercase: false
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Gagal mengubah password!'
      });
    }

    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Apakah Anda yakin ingin keluar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
      Logout();
      navigate('/login');
      }
    });
  
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Memuat informasi pengguna...</p>
      </Container>
    );
  }

  // Redirect if not authenticated
  if (!isAuth() || !user) {
    return null; // The useEffect will handle redirection
  }

  return (
    <Container className="py-5">
      <Tab.Container defaultActiveKey="history">
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <div className="text-center mb-3">
                  <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '100px', height: '100px' }}>
                    {user.user.profile_photo ? (
                      <img 
                        src={user.user.profile_photo} 
                        alt="Profile" 
                        className="rounded-circle" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <i className="fas fa-user fa-3x text-secondary"></i>
                    )}
                  </div>
                  <h5 className="mt-3 mb-0">{userInfo.nama}</h5>
                  <p className="text-muted">{userInfo.email}</p>
                  {user.role && (
                    <span className="badge bg-info">{user.role}</span>
                  )}
                </div>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="history">Riwayat Pesanan</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="account">Informasi Akun</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">Ubah Password</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link onClick={handleLogout} className="text-danger">
                      Logout
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Card>
              <Card.Body>
                <Tab.Content>
                  {/* Riwayat Pesanan */}
                  <Tab.Pane eventKey="history">
                    <h4 className="mb-4">Riwayat Pesanan</h4>
                    {ordersLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Memuat riwayat pesanan...</p>
                      </div>
                    ) : orderHistory.length > 0 ? (
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Tanggal</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderHistory.map((order) => (
                            <tr key={order.id}>
                              <td>{order.id}</td>
                              <td>{order.date}</td>
                              <td>{Array.isArray(order.items) ? order.items.join(', ') : order.items}</td>
                              <td>{order.total}</td>
                              <td>
                                <span className={`badge bg-${
                                  order.status === 'Selesai' ? 'success' : 
                                  order.status === 'Dikirim' ? 'primary' : 
                                  order.status === 'Dibatalkan' ? 'danger' : 'warning'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info">
                        Anda belum memiliki riwayat pesanan.
                      </Alert>
                    )}
                  </Tab.Pane>

                  {/* Informasi Akun */}
                  <Tab.Pane eventKey="account">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Informasi Akun</h4>
                      {!isEditing && (
                        <Button 
                          variant="outline-primary" 
                          onClick={handleEditToggle}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Edit Informasi
                        </Button>
                      )}
                    </div>
                    
                    <Form onSubmit={handleInfoUpdate}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nama Lengkap</Form.Label>
                            <Form.Control
                              type="text"
                              value={isEditing ? tempUserInfo.nama : userInfo.nama}
                              onChange={(e) => setTempUserInfo({...tempUserInfo, nama: e.target.value})}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={isEditing ? tempUserInfo.email : userInfo.email}
                              onChange={(e) => setTempUserInfo({...tempUserInfo, email: e.target.value})}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nomor Telepon</Form.Label>
                            <Form.Control
                              type="tel"
                              value={isEditing ? tempUserInfo.telepon : userInfo.telepon}
                              onChange={(e) => setTempUserInfo({...tempUserInfo, telepon: e.target.value})}
                              disabled={!isEditing}
                              placeholder="Contoh: 08123456789"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              value={isEditing ? tempUserInfo.gender : userInfo.gender}
                              onChange={(e) => setTempUserInfo({...tempUserInfo, gender: e.target.value})}
                              disabled={!isEditing}
                            >
                              <option value="">Pilih Gender</option>
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      {/* Display user role (read-only) */}
                      {user.role && (
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Role</Form.Label>
                              <Form.Control
                                type="text"
                                value={user.role}
                                disabled
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Jumlah Pesanan</Form.Label>
                              <Form.Control
                                type="text"
                                value={user.total_order || 0}
                                disabled
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      )}
                      
                      {isEditing && (
                        <div className="d-flex gap-2">
                          <Button type="submit" variant="primary">
                            Simpan Perubahan
                          </Button>
                          <Button type="button" variant="secondary" onClick={handleEditToggle}>
                            Batal
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Tab.Pane>

                  {/* Ubah Password */}
                  <Tab.Pane eventKey="password">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Ubah Password</h4>
                    </div>
                    <Form onSubmit={handlePasswordChange}>
                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Password Saat Ini*</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPasswords.current ? "text" : "password"}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.current ? '-slash' : ''}`}></i>
                          </Button>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Password Baru*</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPasswords.new ? "text" : "password"}
                            value={passwords.newPassword}
                            onChange={(e) => {
                              setPasswords({...passwords, newPassword: e.target.value});
                              validatePasswordRules(e.target.value);
                            }}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.new ? '-slash' : ''}`}></i>
                          </Button>
                        </div>
                        <div className="mt-2">
                          <div className={`small ${passwordValidation.length ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.length ? 'check' : 'times'} me-2`}></i>
                            Minimal 8 karakter
                          </div>
                          <div className={`small ${passwordValidation.number ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.number ? 'check' : 'times'} me-2`}></i>
                            Minimal 1 angka
                          </div>
                          <div className={`small ${passwordValidation.uppercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.uppercase ? 'check' : 'times'} me-2`}></i>
                            Minimal 1 huruf kapital
                          </div>
                          <div className={`small ${passwordValidation.lowercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.lowercase ? 'check' : 'times'} me-2`}></i>
                            Minimal 1 huruf kecil
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4 position-relative">
                        <Form.Label>Konfirmasi Password Baru*</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.confirm ? '-slash' : ''}`}></i>
                          </Button>
                        </div>
                      </Form.Group>

                      <div className="d-grid">
                        <Button 
                          type="submit" 
                          variant="dark" 
                          size="lg"
                          disabled={!Object.values(passwordValidation).every(rule => rule) || 
                                   !passwords.confirmPassword ||
                                   passwords.newPassword !== passwords.confirmPassword}
                        >
                          KONFIRMASI PASSWORD BARU
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tambahkan Alert untuk feedback */}
        {feedback.message && (
          <Alert 
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback({ type: '', message: '' })}
            className="position-fixed top-0 end-0 m-3"
            style={{ zIndex: 1000 }}
          >
            {feedback.message}
          </Alert>
        )}
      </Tab.Container>
    </Container>
  );
}

export default Akun;