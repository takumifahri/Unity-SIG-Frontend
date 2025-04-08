import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Router } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const { Login } = useAuth(); // Gunakan login dari AuthContext, perhatikan huruf kecil 'login'
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Semua field harus diisi');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Menggunakan fungsi login dari AuthContext
      const result = await Login(formData.email, formData.password);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: 'Anda akan diarahkan ke halaman akun.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/akun'); // Arahkan ke halaman akun setelah login berhasil
        });
      } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: result.message || 'Login gagal. Silakan coba lagi.'
      });
      setError(result.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: 'Terjadi kesalahan saat login. Silakan coba lagi.'
      });
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Redirect ke endpoint Google login di Laravel
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  // Cek apakah ada parameter error di URL (dari redirect)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
        alert('Login dengan Google gagal, silakan coba lagi');
    }
  }, []);

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Login</h2>
                  <p className="text-muted">Silakan masuk ke akun Anda</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>

                  <div className="mb-4 position-relative">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Masukkan password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-link password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`far fa-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-dark btn-lg"
                      disabled={loading}
                    >
                      {loading ? 'LOADING...' : 'LOGIN'}
                    </button>
                     {/* Google */}
                    <button
                      type="button"
                      className="btn btn-lg bg-white text-black border mt-3"
                      onClick={handleGoogleLogin}
                    >
                      <svg aria-label="Google logo" width="27" height="27" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                      Login with Google
                    </button>
                  </div>
                  
                 
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;