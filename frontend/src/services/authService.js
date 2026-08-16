import API from './api.js';

/**
 * Auth Service - Front-end API wrapper for authentication endpoints
 */
export const authService = {
  // Register a new customer directly
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Login user with Email & Password
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Request password reset OTP code (Nodemailer + Gmail SMTP)
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password using 6-digit OTP code
  resetPassword: async (resetData) => {
    const response = await API.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Logout user and clear cookies/tokens
  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  // Get current logged-in user profile
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Update profile (name, phone, avatar file upload)
  updateProfile: async (profileData) => {
    const isFormData = profileData instanceof FormData;
    const response = await API.put('/users/profile', profileData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
};

export default authService;
