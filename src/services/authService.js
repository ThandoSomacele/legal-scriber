// src/services/authService.js
import apiClient from '../apiClient';
import logger from '../utils/logger';

class AuthService {
  // Sign up with email verification
  async signup(name, email, password) {
    try {
      const response = await apiClient.post('/api/auth/signup', {
        name,
        email,
        password,
      });

      // Don't store token yet - wait for email confirmation
      return response.data;
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  // Resend verification email
  async resendVerification(email) {
    try {
      const response = await apiClient.post('/api/auth/resend-verification', {
        email,
      });
      return response.data;
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }

  // Login with additional checks
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      // Check if email is confirmed
      if (!response.data.isEmailConfirmed) {
        throw new Error('Please verify your email before logging in');
      }

      // Store token only after successful login
      localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    // Clear any other stored user data
    localStorage.removeItem('user');
  }
}

export default new AuthService();
