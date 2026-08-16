import API from './api.js';

/**
 * Product & Category Service - Frontend API Wrapper
 */
export const productService = {
  // Get all active departments/categories
  getCategories: async () => {
    const response = await API.get('/categories');
    return response.data;
  },

  // Get single category
  getCategoryById: async (id) => {
    const response = await API.get(`/categories/${id}`);
    return response.data;
  },

  // Get products with query parameters (search, category, brand, minPrice, maxPrice, sort, page)
  getProducts: async (params = {}) => {
    const response = await API.get('/products', { params });
    return response.data;
  },

  // Get featured products for homepage
  getFeaturedProducts: async () => {
    const response = await API.get('/products/featured');
    return response.data;
  },

  // Get single product details + related products
  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  // Admin: Create Product
  createProduct: async (productData) => {
    const response = await API.post('/products', productData);
    return response.data;
  },

  // Admin: Update Product
  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },

  // Admin: Delete Product
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
