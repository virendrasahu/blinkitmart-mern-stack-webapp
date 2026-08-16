import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import ProductDetailsModal from '../../components/product/ProductDetailsModal.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import productService from '../../services/productService.js';
import { FiFilter, FiSliders, FiRotateCcw, FiFrown } from 'react-icons/fi';

/**
 * Products Catalog Page Component with Filters, Sorting & Pagination
 */
function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL query params
  const categoryParam = searchParams.get('category') || '';
  const isFeaturedParam = searchParams.get('isFeatured') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  // Component state
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination & Filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(sortParam);

  // Sync category param change from URL
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setPage(1);
  }, [categoryParam]);

  // Fetch categories list
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await productService.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products whenever filters, sorting or page change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory,
          isFeatured: isFeaturedParam,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort: sortBy,
          page,
          limit: 12,
        };

        const res = await productService.getProducts(params);
        if (res.success) {
          setProducts(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalProducts(res.totalProducts || res.data.length);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, isFeaturedParam, minPrice, maxPrice, sortBy, page]);

  // Reset all filters to default
  const resetFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {isFeaturedParam === 'true'
                ? '⚡ Trending & Featured Items'
                : selectedCategory
                ? `${categories.find(c => c.slug === selectedCategory)?.name || 'Department'} Products`
                : 'All Groceries & Essentials'}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Showing {products.length} of {totalProducts} products available for 10-minute delivery
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Main Content: Sidebar Filters + Product Grid & Pagination */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filter Panel */}
          <aside className="w-full lg:w-64 bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs shrink-0 self-start">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                <FiSliders className="text-primary" /> Filters
              </div>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-gray-400 hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FiRotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Filter 1: Department Categories */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => {
                      setSelectedCategory('');
                      setPage(1);
                    }}
                    className="accent-primary"
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.slug}
                      onChange={() => {
                        setSelectedCategory(cat.slug);
                        setPage(1);
                      }}
                      className="accent-primary"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 2: Price Range */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Price Range (₹)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

          </aside>

          {/* Right Product Grid & Pagination Area */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 h-64 border border-gray-100 animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-xl mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-full mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onOpenModal={(prod) => setSelectedProduct(prod)}
                    />
                  ))}
                </div>

                {/* Reusable Pagination Controls */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  itemLabel="products"
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto my-8 shadow-2xs">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  <FiFrown />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No products match filters</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Try widening your price range or clearing category filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default Products;
