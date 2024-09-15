import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await apiClient.get('/api/user/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      const userResponse = await apiClient.get('/api/user/profile');
      setUser(userResponse.data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await apiClient.post('/api/auth/signup', { name, email, password });
      localStorage.setItem('token', response.data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      const userResponse = await apiClient.get('/api/user/profile');
      setUser(userResponse.data);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
