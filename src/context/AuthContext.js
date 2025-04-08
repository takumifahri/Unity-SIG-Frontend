// Auth Validation
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {  // Perbaikan: "children" (huruf kecil) bukan "Children"
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token')); // Perbaikan: menghapus * yang keliru
    const [loading, setLoading] = useState(true);

    // pengecekan untuk token login 
    useEffect(() => {
        const inisialisasi = async() => {
            if (token){
                try{
                    // validasi token yg akan dikirim ke backend
                    const resp = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/whoami`, {
                        headers: {
                            'Content-Type' : 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUser(resp.data);
                } catch (error){
                    console.log('failed to validating yours token', error);
                    localStorage.removeItem('token'); // Tambahan: hapus token jika tidak valid
                    setToken(null);
                }
            }
            setLoading(false);
        };
        inisialisasi();
    }, [token]);

    const Login = async(email, password) => {
        try{
            const respLogin = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                email,
                password
            });

            const { token, user } = respLogin.data;
            localStorage.setItem('token', token);
            setUser(user);
            setToken(token);
            return { success: true }; // Tambahan: return success
        } catch(error){
            console.log('failed to login', error);
            return {
                message: error.response?.data?.message || 'Login gagal',
                success: false
            };
        }
    };

    const Logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    // pengecekan apakah user sudah masuk atau authetikansi
    const isAuth = () => {
        return user !== null;
    };

    const value = {
        user,
        token,
        Login,
        Logout,
        isAuth,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
    
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};