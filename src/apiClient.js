import axios from 'axios';
import envConfig from './../envConfig.js';

const apiClient = axios.create({
  baseURL: envConfig.apiUrl,
  withCredentials: true,
});

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
