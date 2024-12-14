import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../apiClient';
import clientLogger from '../utils/clientLogger';
import AuthContext from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await apiClient.get('/api/user/profile');
          setUser(response.data);
        } catch (error) {
          clientLogger.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const signup = async (name, email, password) => {
    try {
      const response = await apiClient.post('/api/auth/signup', {
        name,
        email,
        password,
      });
      clientLogger.info('Signup successful:', email);
      return response.data;
    } catch (error) {
      clientLogger.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        clientLogger.info('Login successful:', email);
      }

      return response.data;
    } catch (error) {
      clientLogger.error('Login error:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async email => {
    try {
      const response = await apiClient.post('/api/auth/resend-verification', {
        email,
      });
      clientLogger.info('Verification email resent:', email);
      return response.data;
    } catch (error) {
      clientLogger.error('Resend verification error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    clientLogger.info('User logged out');
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
