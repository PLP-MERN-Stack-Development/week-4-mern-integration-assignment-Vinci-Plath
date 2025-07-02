// authService.js - Authentication service for handling user authentication

import api from './api';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response data and error state
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  },

  /**
   * Login user with email and password
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} Response data and error state
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  },

  /**
   * Logout the current user
   */
  logout() {
    // Clear all auth related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear authorization header
    delete api.defaults.headers.common['Authorization'];
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User data and error state
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch user data' 
      };
    }
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.data.token) {
        // Update stored tokens
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      // If refresh fails, clear auth data
      this.logout();
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get stored auth token
   * @returns {string|null} Auth token or null if not found
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get stored refresh token
   * @returns {string|null} Refresh token or null if not found
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data or null if not found
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Aliases for backward compatibility
  loginUser: function(credentials) { return this.login(credentials); },
  registerUser: function(userData) { return this.register(userData); }
};

export default authService;
