import API from './api.js';

/**
 * Cart Service - Front-end API Wrapper for Cart Endpoints
 */
export const cartService = {
  // Get cart items and price summary
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },

  // Add product to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await API.post('/cart', { productId, quantity });
    return response.data;
  },

  // Update product quantity in cart
  updateCartItem: async (productId, quantity) => {
    const response = await API.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  // Remove single product from cart
  removeFromCart: async (productId) => {
    const response = await API.delete(`/cart/${productId}`);
    return response.data;
  },

  // Clear all items in cart
  clearCart: async () => {
    const response = await API.delete('/cart');
    return response.data;
  },
};

export default cartService;
