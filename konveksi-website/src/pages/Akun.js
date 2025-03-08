import React, { useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Akun() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    nama: 'John Doe',
    email: 'john@example.com',
    telepon: '081234567890',
    gender: 'Laki-laki'
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Tambahkan state untuk feedback
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  // Contoh data pesanan (nanti bisa diambil dari API/database)
  const orderHistory = [
    {
      id: '#ORD001',
      date: '2024-03-15',
      items: ['Gamis Modern Cream', 'Hijab Pashmina'],
      total: 'Rp 525.000',
      status: 'Selesai'
    },
    {
      id: '#ORD002',
      date: '2024-03-10',
      items: ['Tunic Brown'],
      total: 'Rp 275.000',
      status: 'Dikirim'
    }
  ];

  // Validasi email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validasi nomor telepon
  const validatePhone = (phone) => {
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
  };

  const handleInfoUpdate = (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!userInfo.nama.trim()) {
      setFeedback({
        type: 'danger',
        message: 'Nama tidak boleh kosong'
      });
      return;
    }

    if (!validateEmail(userInfo.email)) {
      setFeedback({
        type: 'danger',
        message: 'Format email tidak valid'
      });
      return;
    }

    if (!validatePhone(userInfo.telepon)) {
      setFeedback({
        type: 'danger',
        message: 'Format nomor telepon tidak valid'
      });
      return;
    }

    // Implement update user info logic here
    setFeedback({
      type: 'success',
      message: 'Informasi akun berhasil diperbarui!'
    });

    // Reset feedback after 3 seconds
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    // Validasi password
    if (passwords.newPassword.length < 8) {
      setFeedback({
        type: 'danger',
        message: 'Password baru minimal 8 karakter'
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

    // Implement password change logic here
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

    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      // Implement logout logic here (clear session/token)
      localStorage.removeItem('user'); // Contoh
      navigate('/');
    }
  };

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
                    <i className="fas fa-user fa-3x text-secondary"></i>
                  </div>
                  <h5 className="mt-3 mb-0">{userInfo.nama}</h5>
                  <p className="text-muted">{userInfo.email}</p>
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
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Tanggal</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderHistory.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.date}</td>
                            <td>{order.items.join(', ')}</td>
                            <td>{order.total}</td>
                            <td>
                              <span className={`badge bg-${
                                order.status === 'Selesai' ? 'success' : 'primary'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                Detail
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Tab.Pane>

                  {/* Informasi Akun */}
                  <Tab.Pane eventKey="account">
                    <h4 className="mb-4">Informasi Akun</h4>
                    <Form onSubmit={handleInfoUpdate}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nama Lengkap</Form.Label>
                            <Form.Control
                              type="text"
                              value={userInfo.nama}
                              onChange={(e) => setUserInfo({...userInfo, nama: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={userInfo.email}
                              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
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
                              value={userInfo.telepon}
                              onChange={(e) => setUserInfo({...userInfo, telepon: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              value={userInfo.gender}
                              onChange={(e) => setUserInfo({...userInfo, gender: e.target.value})}
                            >
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button type="submit" variant="primary">
                        Simpan Perubahan
                      </Button>
                    </Form>
                  </Tab.Pane>

                  {/* Ubah Password */}
                  <Tab.Pane eventKey="password">
                    <h4 className="mb-4">Ubah Password</h4>
                    <Form onSubmit={handlePasswordChange}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password Saat Ini</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Password Baru</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                          required
                          minLength={8}
                        />
                        <Form.Text className="text-muted">
                          Password minimal 8 karakter
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Konfirmasi Password Baru</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                          required
                        />
                      </Form.Group>
                      <Button type="submit" variant="primary">
                        Ubah Password
                      </Button>
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