// Auth Validation
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Fetch user data on mount or when token changes
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    // Make sure token is properly formatted for authorization header
                    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                    
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}/api/auth/me`, 
                        {
                            headers: {
                                Authorization: authToken
                            }
                        }
                    );
                    console.log("Fetched user data:", response.data);
                    
                    // Standardize user data structure regardless of source
                    if (response.data) {
                        // Handle different response structures
                        const userData = response.data.user || response.data;
                        setUser({ user: userData });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Clear token if unauthorized
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    // Regular login function
    const Login = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                email,
                password,
            });
    
            const { access_token, user, token_type } = response.data;
            console.log('Login response:', response.data);
            
            if (!access_token) {
                throw new Error('Token is missing from response.');
            }
    
            const fullToken = `${token_type || 'Bearer'} ${access_token}`;
            localStorage.setItem('token', fullToken);
            
            // Set user and token in context
            setUser(user ? { user } : response.data);
            setToken(fullToken);
            
            return {
                success: true,
                user: user || response.data,
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

    // Google OAuth login handler
    const GoogleLogin = async (tokenResponse) => {
        try {
            console.log('Google OAuth response:', tokenResponse);
            
            // If you're getting the token directly from Google OAuth
            const googleToken = tokenResponse.access_token || tokenResponse.token || tokenResponse;
            
            // Make a request to your backend to validate Google token and get user data
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/google/callback`,
                { token: googleToken }
            );
            
            console.log('Backend response for Google login:', response.data);
            
            const { access_token, user, token_type } = response.data;
            
            if (!access_token) {
                throw new Error('Token is missing from Google login response');
            }
            
            const fullToken = `${token_type || 'Bearer'} ${access_token}`;
            localStorage.setItem('token', fullToken);
            
            // Set user and token in context
            setUser(user ? { user } : response.data);
            setToken(fullToken);
            
            return {
                success: true,
                user: user || response.data,
                token: fullToken
            };
        } catch (error) {
            console.error('Google login failed:', error);
            const message = error.response?.data?.message || 'Google login gagal. Coba lagi.';
            return {
                success: false,
                message
            };
        }
    };
    
    const Logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    // Check if user is authenticated
    const isAuth = () => {
        return user !== null;
    };

    const value = {
        user,
        token,
        Login,
        GoogleLogin, // Add the GoogleLogin function to context
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