import API from './api.js';

/**
 * Order Service - Front-end API Wrapper
 */
export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  // Get customer order history
  getMyOrders: async () => {
    const response = await API.get('/orders');
    return response.data;
  },

  // Get order details by ID
  getOrderById: async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await API.put(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderService;
