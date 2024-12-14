// src/apiClient.js
import axios from 'axios';
import envConfig from '../envConfig.js';

const apiClient = axios.create({
  baseURL: envConfig.apiUrl,
  withCredentials: true,
});

// List of routes that don't need authentication
const publicRoutes = [
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/confirm-email',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Check if the route needs authentication
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));

    // Only add token for non-public routes
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor remains the same...
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only handle token-related 401s
      if (error.response.data.message.includes('token')) {
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
