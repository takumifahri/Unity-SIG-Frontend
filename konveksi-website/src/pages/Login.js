import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Semua field harus diisi');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Format email tidak valid');
      return;
    }

    const userData = {
      email: formData.email,
      telepon: '081234567890',
      gender: 'Laki-laki'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/akun');
  };

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="shadow border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Login</h2>
                  <p className="text-muted">Silakan masuk ke akun Anda</p>
                </div>

                {error && (
                  <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4 position-relative">
                    <Form.Label>Password</Form.Label>
                    <div className="password-input-wrapper">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Masukkan password"
                        required
                      />
                      <Button
                        variant="link"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <i className={`far fa-eye${showPassword ? '-slash' : ''}`}></i>
                      </Button>
                    </div>
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="dark" type="submit" size="lg">
                      LOGIN
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login; 