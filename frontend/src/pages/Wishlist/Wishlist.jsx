import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import ProductDetailsModal from '../../components/product/ProductDetailsModal.jsx';
import wishlistService from '../../services/wishlistService.js';
import { FiHeart, FiFrown, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';
import { toast } from 'react-toastify';

/**
 * Wishlist Page Component (/wishlist)
 */
function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      if (res.success) {
        setWishlistItems(res.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (product) => {
    await addToCart(product, 1);
    toast.success(`Moved ${product.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiHeart className="text-red-500 fill-current" /> Saved Wishlist ({wishlistItems.length})
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-64 border border-gray-100 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-4"></div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto my-12 shadow-2xs">
            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              <FiHeart />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your wishlist is empty</h3>
            <p className="text-xs text-gray-500 mb-6">Save items you love to purchase later.</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {wishlistItems.map((product) => (
              <div key={product._id} className="relative group">
                <ProductCard
                  product={product}
                  onOpenModal={(prod) => setSelectedProduct(prod)}
                />
              </div>
            ))}
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

export default Wishlist;
