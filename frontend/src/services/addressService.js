import API from './api.js';

/**
 * Address Service - Front-end API Wrapper
 */
export const addressService = {
  // Get all saved user addresses
  getAddresses: async () => {
    const response = await API.get('/addresses');
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await API.post('/addresses', addressData);
    return response.data;
  },

  // Update existing address
  updateAddress: async (id, addressData) => {
    const response = await API.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id) => {
    const response = await API.delete(`/addresses/${id}`);
    return response.data;
  },

  // Set address as default
  setDefaultAddress: async (id) => {
    const response = await API.put(`/addresses/${id}/set-default`);
    return response.data;
  },
};

export default addressService;
