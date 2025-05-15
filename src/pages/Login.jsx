
import { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
// import { Router } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react"
function Login() {
  const navigate = useNavigate();
  const { Login, GoogleLogin } = useAuth(); // Gunakan Login dan GoogleLogin dari AuthContext
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
  // Anda memiliki dua opsi untuk Google login:
  // 1. Opsi dengan redirect ke Google - seperti yang Anda implementasikan sebelumnya
  // 2. Opsi dengan Google API client dan menggunakan GoogleLogin dari AuthContext
  
  // Opsi 1: Redirect ke endpoint backend (backend mengurus OAuth flow)
  const handleGoogleLoginRedirect = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };
  
  // Opsi 2: Menggunakan Google API client di frontend (jika Anda menggunakan gapi)
  const handleGoogleLogin = async (response) => {
    try {
      // Jika menggunakan Google API client atau Google Sign-In button
      // yang mengembalikan token langsung
      if (response && (response.access_token || response.credential)) {
        const result = await GoogleLogin(response);
        
        if (result.success) {
          Swal.fire({
            icon: 'success',
            title: 'Login Berhasil',
            text: 'Anda akan diarahkan ke halaman akun.',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            navigate('/akun');
          });
        } else {
          setError(result.message || 'Login dengan Google gagal');
        }
      } else {
        // Fallback ke opsi redirect jika tidak ada response
        handleGoogleLoginRedirect();
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Terjadi kesalahan saat login dengan Google');
    }
  };

  // Facebook login dengan redirect
  const handleFacebookLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/facebook`;
  };

  // Cek apakah ada parameter dari OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const token = params.get('token');
    const googleToken = params.get('google_token');
    
    if (error) {
      setError('Login dengan social media gagal, silakan coba lagi');
    }
    
    // Jika ada token dari OAuth redirect
    if (token) {
      // Gunakan format Bearer token
      const fullToken = `Bearer ${token}`;
      localStorage.setItem('token', fullToken);
      
      // Refresh halaman atau arahkan ke halaman akun
      navigate('/akun');
    }
    
    // Jika ada token Google dari redirect (OAuth callback)
    if (googleToken) {
      // Gunakan fungsi GoogleLogin dari AuthContext
      GoogleLogin(googleToken)
        .then(result => {
          if (result.success) {
            Swal.fire({
              icon: 'success',
              title: 'Login Berhasil',
              text: 'Anda akan diarahkan ke halaman akun.',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              navigate('/akun');
            });
          } else {
            setError(result.message || 'Login dengan Google gagal');
          }
        })
        .catch(err => {
          console.error('Error processing Google token:', err);
          setError('Terjadi kesalahan saat memproses login Google');
        });
    }
  }, [navigate, GoogleLogin]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1546213290-e1b492ab3eee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 bg-opacity-90 backdrop-blur-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-gray-600">Silakan masuk ke akun Anda</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 relative">
            {error}
            <button
              type="button"
              className="absolute top-2 right-2 text-red-700"
              onClick={() => setError("")}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6D4C3D] focus:border-[#6D4C3D]"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6D4C3D] focus:border-[#6D4C3D]"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Tidak punya akun?{" "}
              <a href="/register" className="text-[#6D4C3D] hover:underline">
                Daftar segera!
              </a>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#6D4C3D] text-white py-2 px-4 rounded-md hover:bg-[#6B4838] focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:ring-offset-2 transition-colors"
            disabled={loading}
          >
            {loading ? "LOADING..." : "LOGIN"}
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-300 absolute w-full"></div>
            <div className="bg-white px-3 relative text-gray-500 text-sm">OR</div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:ring-offset-2 transition-colors"
            onClick={handleGoogleLogin}
          >
            <svg
              aria-label="Google logo"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path>
                <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path>
                <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path>
                <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path>
              </g>
            </svg>
            Login with Google
          </button>
        </form>
      </div>
    </div>
    );
}

export default Login;