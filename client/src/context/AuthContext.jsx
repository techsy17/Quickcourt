import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('quickcourt_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    return res;
  };

  const verifyOTP = async ({ email, otp }) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.success && res.data?.token) {
      localStorage.setItem('quickcourt_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const resendOTP = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res;
  };

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.success && res.data?.token) {
      localStorage.setItem('quickcourt_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('quickcourt_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/me', data);
    if (res.success && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const loginAsDemo = async (targetRole) => {
    let credentials;
    if (targetRole === 'ADMIN') {
      credentials = { email: 'admin@quickcourt.com', password: 'Password123!' };
    } else if (targetRole === 'FACILITY_OWNER') {
      credentials = { email: 'owner@quickcourt.com', password: 'Password123!' };
    } else {
      credentials = { email: 'user@quickcourt.com', password: 'Password123!' };
    }
    return await login(credentials);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role,
        signup,
        verifyOTP,
        resendOTP,
        login,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
