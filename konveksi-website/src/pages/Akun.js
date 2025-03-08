import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Akun() {
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      nama: '',
      email: '',
      telepon: '',
      gender: ''
    };
  });

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

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

  // Tambahkan state baru untuk mode edit dan temporary data
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({...userInfo});

  // Tambahkan state untuk validasi password
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false
  });

  // Tambahkan state untuk visibility toggle
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Jika sedang dalam mode edit dan klik batal, kembalikan ke data asli
      setTempUserInfo({...userInfo});
    }
    setIsEditing(!isEditing);
  };

  const handleInfoUpdate = (e) => {
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

    if (!validatePhone(tempUserInfo.telepon)) {
      setFeedback({
        type: 'danger',
        message: 'Format nomor telepon tidak valid'
      });
      return;
    }

    // Update userInfo dengan data temporary
    setUserInfo({...tempUserInfo});
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(tempUserInfo));
    
    setFeedback({
      type: 'success',
      message: 'Informasi akun berhasil diperbarui!'
    });

    // Nonaktifkan mode edit
    setIsEditing(false);

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

  const handlePasswordChange = (e) => {
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
    setPasswordValidation({
      length: false,
      number: false,
      uppercase: false,
      lowercase: false
    });

    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      navigate('/login');
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
                          </tr>
                        ))}
                      </tbody>
                    </Table>
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
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
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
                      <h4 className="mb-0">Change Password</h4>
                      <Button 
                        variant="link" 
                        className="p-0 text-dark" 
                        style={{ fontSize: '1.5rem' }}
                        onClick={() => navigate(-1)}
                      >
                        ×
                      </Button>
                    </div>
                    <Form onSubmit={handlePasswordChange}>
                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Current Password*</Form.Label>
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
                        <Form.Label>New Password*</Form.Label>
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
                            More than 8 characters
                          </div>
                          <div className={`small ${passwordValidation.number ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.number ? 'check' : 'times'} me-2`}></i>
                            1 number
                          </div>
                          <div className={`small ${passwordValidation.uppercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.uppercase ? 'check' : 'times'} me-2`}></i>
                            1 uppercase
                          </div>
                          <div className={`small ${passwordValidation.lowercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.lowercase ? 'check' : 'times'} me-2`}></i>
                            1 lowercase
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4 position-relative">
                        <Form.Label>Confirm new Password*</Form.Label>
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
                          CONFIRM NEW PASSWORD
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