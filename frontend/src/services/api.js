import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Handle token expiration / unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      // Only redirect if not already on login page to avoid infinite loops
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const signup = (userData) =>
  axios.post('/auth/signup', userData);

export const login = (credentials) =>
  axios.post('/auth/login', credentials);

export const logout = () =>
  axios.post('/auth/logout');

export const getCurrentUser = () =>
  axios.get('/auth/me');

// Product API
export const getProducts = (params) =>
  axios.get('/products/', { params });

export const deleteProduct = (productId) =>
  axios.delete(`/products/${productId}`);

export const createProduct = (productData) =>
  axios.post('/products/', productData);

export const updateProduct = (productId, productData) =>
  axios.patch(`/products/${productId}`, productData);

// Forecast (admin)
export const calculateForecast = () =>
  axios.post('/forecast/calculate');
export const getForecastChartData = () =>
  axios.get('/forecast/chart-data');

// Optimization
export const calculateOptimization = () =>
  axios.post('/optimization/calculate');
export const getOptimizationResults = (params) =>
  axios.get('/optimization/results', { params });