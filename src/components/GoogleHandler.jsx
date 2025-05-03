import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleHandler() {
    const navigate = useNavigate();
    const { setToken, fetchUser } = useAuth();
  
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
  
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
  
        fetchUser(); // opsional jika pakai context yang fetch user
  
        // Clean URL
        window.history.replaceState({}, document.title, "/akun");
        navigate("/akun");
      }
    }, []);
  
    return null;
}