import API from './api.js';

/**
 * Admin Service - Front-end API Wrapper
 */
export const adminService = {
  // Get Admin Dashboard Stats
  getDashboardStats: async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
  },
};

export default adminService;
