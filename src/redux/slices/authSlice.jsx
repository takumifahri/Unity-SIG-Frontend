import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

// Async action for logging in
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { access_token, user, token_type, expires_in } = response.data;
      
      if (!access_token) {
        throw new Error('Token is missing from response.');
      }

      const fullToken = `${token_type || 'Bearer'} ${access_token}`;
      localStorage.setItem('token', fullToken);
      
      // Set token expiration to a maximum of 2 days
      const maxExpiration = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
      const expirationTime = Math.min(expires_in * 1000, maxExpiration);
      const expirationDate = new Date().getTime() + expirationTime;
      localStorage.setItem('token_expiration', expirationDate);
      
      return {
        user,
        token: fullToken,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// Google login thunk
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (tokenResponse, { rejectWithValue }) => {
    try {
      const googleToken = tokenResponse.access_token || tokenResponse.credential || tokenResponse;
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google/callback`,
        { token: googleToken }
      );
      
      const { access_token, user, token_type } = response.data;
      const fullToken = `${token_type || 'Bearer'} ${access_token}`;
      
      localStorage.setItem('token', fullToken);
      
      return {
        user,
        token: fullToken,
        success: true
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Google login failed',
        success: false
      });
    }
  }
);

// Fetch current user
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: token
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiration');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// Helper selector to check if user is authenticated
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;