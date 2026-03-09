import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const signup = (userData) => 
  axios.post('/auth/signup', userData);

export const login = (credentials) => 
  axios.post('/auth/login', credentials);

export const getCurrentUser = () => 
  axios.get('/auth/me');

// Product API
export const getProducts = () => 
  axios.get('/products');