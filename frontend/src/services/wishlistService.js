import API from './api.js';

/**
 * Wishlist Service - Front-end API Wrapper
 */
export const wishlistService = {
  // Get saved wishlist items
  getWishlist: async () => {
    const response = await API.get('/wishlist');
    return response.data;
  },

  // Toggle product in wishlist
  toggleWishlist: async (productId) => {
    const response = await API.post(`/wishlist/${productId}`);
    return response.data;
  },
};

export default wishlistService;
