
import { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
// import { Router } from 'react-router-dom';

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
      // Tidak perlu meneruskan setUser dan setToken karena sudah dihandle di dalam Login
      const result = await Login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: 'Anda akan diarahkan ke halaman akun.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Tambahkan delay sebelum navigasi untuk memastikan state sudah terupdate
          setTimeout(() => {
            navigate('/akun');
          }, 500);
        });
      } else {
        // ... kode error handling (tidak berubah)
        setError('Login gagal, silakan coba lagi');
      }
    } catch (err) {
      // ... kode error handling (tidak berubah)
      console.error('Login error:', err);
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  // Redirect ke endpoint Google login di Laravel
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook`;
  };

  // Cek apakah ada parameter error di URL (dari redirect)
  useEffect(() => {
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
                    <p className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>
                      Tidak punya akun? <a href="/register" className="text-decoration-none">Daftar segera!</a>
                    </p>
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-dark btn-lg"
                      disabled={loading}
                    >
                      {loading ? 'LOADING...' : 'LOGIN'}
                    </button>

                    <div className="text-center my-3">
                      <span className="text-muted" style={{fontSize: '1.2rem'}}>OR</span>
                    </div>

                    <button
                      type="button"
                      className="btn  bg-white text-black border "
                      onClick={handleGoogleLogin}
                    >
                      <svg aria-label="Google logo" width="27" height="27" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                      Login with Google
                    </button>
                    {/* Facebook */}
                    <button 
                     type="button"
                     className="btn btn-lg my-2 text-white border "
                     style={{backgroundColor: '#1A77F2'}}
                     onClick={handleFacebookLogin}>
                      <svg aria-label="Facebook logo" width="27" height="27" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"></path></svg>
                      Login with Facebook
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