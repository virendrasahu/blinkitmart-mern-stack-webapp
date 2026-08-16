import axios from 'axios';

/**
 * Central Axios Instance for Backend API Communication
 * 
 * - Uses process.env or Vite's import.meta.env.VITE_API_URL
 * - Automatically includes credentials (cookies) in requests
 * - Dynamically configures headers for JSON and FormData file uploads
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

/**
 * Request Interceptor
 * Dynamically attaches the JWT token from localStorage and sets correct Content-Type.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData requests (e.g. image file uploads), delete default Content-Type header
    // so the browser automatically sets 'multipart/form-data; boundary=...'
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Simplifies API error handling across components.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract exact backend error message if available
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default API;
