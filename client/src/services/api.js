// api.js - Centralized API service with token refresh and error handling

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For sending cookies
  timeout: 10000 // 10 second timeout
});

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};



// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Import authService here to avoid circular dependency
          const { refreshToken: refreshAuth } = await import('./authService');
          const { token, refreshToken: newRefreshToken } = await refreshAuth(refreshToken);
          
          // Update tokens in storage
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Process any queued requests
          processQueue(null, token);
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        authService.logout();
        window.location.href = '/login';
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Handle different HTTP status codes
      switch (error.response.status) {
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error occurred');
          break;
        default:
          console.error('An error occurred:', error.response.status);
      }
      
      // Return a more user-friendly error message if available
      if (error.response.data?.message) {
        return Promise.reject(new Error(error.response.data.message));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('Unable to connect to the server. Please check your internet connection.'));
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Post API services
export const postService = {
  // Get all posts with optional filtering and search
  getPosts: async (params = {}) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        categories, 
        search, 
        sort = '-updatedAt' 
      } = params;
      // Build query params
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      if (category) queryParams.append('category', category);
      if (categories) queryParams.append('categories', categories);
      if (search) queryParams.append('search', search);
      if (sort) queryParams.append('sort', sort);
      const response = await api.get(`/posts?${queryParams.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch posts' 
      };
    }
  },
  // Get a single post by ID
  getPostById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to fetch post. Please try again.'
      };
    }
  },
  // Create a new post
  createPost: async (postData) => {
    try {
      const formData = new FormData();
      formData.append('title', postData.title || '');
      formData.append('content', postData.content || '');
      formData.append('category', postData.category || '');
      if (postData.image) {
        formData.append('image', postData.image);
      }
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const response = await api.post('/posts', formData, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to create post' 
      };
    }
  },
  // Update an existing post
  updatePost: async (id, postData) => {
    try {
      const formData = new FormData();
      formData.append('title', postData.title || '');
      formData.append('content', postData.content || '');
      formData.append('category', postData.category || '');
      if (postData.image) {
        formData.append('image', postData.image);
      }
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const response = await api.put(`/posts/${id}`, formData, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to update post' 
      };
    }
  },
  // Delete a post
  deletePost: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to delete post. Please try again.' 
      };
    }
  },
  // Toggle pin status of a post
  togglePinPost: async (id, isPinned) => {
    try {
      const response = await api.put(`/posts/${id}/pin`, { isPinned });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to update pin status. Please try again.'
      };
    }
  }
};

// Category API services
export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch categories. Please try again.' 
      };
    }
  },
  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to create category. Please try again.' 
      };
    }
  }
};

// Auth API services
export const authService = {
  // Register a new user
  register: async (userData) => {
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

  // Login user (renamed from login to loginUser for consistency with request)
  loginUser: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
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

  // Alias for loginUser to maintain backward compatibility
  login: async (credentials) => authService.loginUser(credentials),

  // Register user (alias for register to match request)
  registerUser: async (data) => authService.register(data),

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Comment API services
export const commentService = {
  // Get all comments for a post
  getComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || 'Failed to fetch comments.' };
    }
  },
  // Add a comment to a post
  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || 'Failed to add comment.' };
    }
  },
  // Delete a comment from a post
  deleteComment: async (postId, commentId) => {
    try {
      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || 'Failed to delete comment.' };
    }
  }
};

// Export the api instance
export default api;

// Re-export services for backward compatibility
export * from './authService';