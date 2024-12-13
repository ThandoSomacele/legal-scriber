// apiClient.js
import axios from 'axios';
import envConfig from './../envConfig.js';

const apiClient = axios.create({
  baseURL: envConfig.apiUrl,
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
