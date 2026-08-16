import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import ProductDetailsModal from '../../components/product/ProductDetailsModal.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import productService from '../../services/productService.js';
import useDebounce from '../../utils/useDebounce.js';
import { FiSearch, FiFrown, FiArrowLeft } from 'react-icons/fi';

/**
 * Search Page Component with Pagination
 */
function Search() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const debouncedQuery = useDebounce(queryParam, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await productService.getProducts({
          search: debouncedQuery,
          page,
          limit: 12,
        });
        if (res.success) {
          setProducts(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalProducts(res.totalProducts || res.data.length);
        }
      } catch (error) {
        console.error('Error executing search:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link & Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors mb-3">
            <FiArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiSearch className="text-primary" /> Search Results for "{queryParam}"
          </h1>
          {!loading && (
            <p className="text-xs text-gray-500 font-medium mt-1">
              Found {totalProducts} {totalProducts === 1 ? 'item' : 'items'} matching your query
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-64 border border-gray-100 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* Product Grid & Pagination */
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onOpenModal={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemLabel="search results"
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          /* No Results State */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto my-12 shadow-2xs">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              <FiFrown />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-xs text-gray-500 mb-6">
              We couldn't find any items matching "{queryParam}". Try checking spelling or searching for general terms like "milk", "bread", or "apple".
            </p>
            <Link
              to="/products"
              className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all"
            >
              Browse All Products
            </Link>
          </div>
        )}

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

export default Search;
