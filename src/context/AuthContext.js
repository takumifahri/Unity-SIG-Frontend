// Auth Validation
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {  // Perbaikan: "children" (huruf kecil) bukan "Children"
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token')); // Perbaikan: menghapus * yang keliru
    const [loading, setLoading] = useState(true);

    // pengecekan untuk token login 
    // useEffect(() => {
    //     const inisialisasi = async() => {
    //         if (token){
    //             try{
    //                 // validasi token yg akan dikirim ke backend
    //                 const resp = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
    //                     headers: {
    //                         'Content-Type' : 'application/json',
    //                         Authorization: `Bearer ${token}`
    //                     }
    //                 });
    //                 setUser(resp.data);
    //             } catch (error){
    //                 console.log('failed to validating yours token', error);
    //                 localStorage.removeItem('token'); // Tambahan: hapus token jika tidak valid
    //                 setToken(null);
    //             }
    //         }
    //         setLoading(false);
    //     };
    //     inisialisasi();
    // }, [token]);

    // Fetch user data on mount or when token changes
    useEffect(() => {
        const fetchUser = async () => {
        if (token) {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/auth/me`, 
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );
                console.log("Fetched user data:", response.data);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                // Clear token if unauthorized
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
        }
            setLoading(false);
        };

        fetchUser();
    }, [token]);
    const Login = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                email,
                password,
            });
    
            const { access_token, user, token_type } = response.data;
            console.log('Login response:', response.data);
            
            if (!access_token || !user) {
                throw new Error('Token or user data is missing from response.');
            }
    
            const fullToken = `${token_type} ${access_token}`;
            localStorage.setItem('token', fullToken);
            
            // Langsung set user dan token dalam context
            setUser(user);
            setToken(fullToken);
            
            return {
                success: true,
                user,
                token: fullToken,
            };
        } catch (error) {
            console.error('Login failed:', error);
            const message = error.response?.data?.message || 'Login gagal. Coba lagi.';
            return {
                success: false,
                message,
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