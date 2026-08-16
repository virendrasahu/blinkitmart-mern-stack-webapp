import API from './api.js';

/**
 * Coupon Service - Front-end API Wrapper
 */
export const couponService = {
  // Get active coupons list
  getCoupons: async () => {
    const response = await API.get('/coupons');
    return response.data;
  },

  // Apply coupon code against cart subtotal
  applyCoupon: async (code, subtotal) => {
    const response = await API.post('/coupons/apply', { code, subtotal });
    return response.data;
  },
};

export default couponService;
