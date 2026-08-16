import API from './api.js';

/**
 * Helper function to dynamically load Razorpay SDK script tag into head
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If Razorpay script is already present, resolve true
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Payment Service - Front-end API Wrapper
 */
export const paymentService = {
  // Create Razorpay Order
  createRazorpayOrder: async (amount) => {
    const response = await API.post('/payment/create-order', { amount });
    return response.data;
  },

  // Verify Payment Signature on backend
  verifyPayment: async (paymentDetails) => {
    const response = await API.post('/payment/verify', paymentDetails);
    return response.data;
  },
};

export default paymentService;
