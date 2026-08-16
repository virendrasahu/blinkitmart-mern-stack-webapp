import React, { useState, useEffect } from 'react';
import { FiClock, FiPlus, FiMinus, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import wishlistService from '../../services/wishlistService.js';

/**
 * ProductCard Component - Quick Commerce Item Card
 */
function ProductCard({ product, onOpenModal }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // Find quantity in cart
  const cartItem = cartItems.find((item) => {
    const pId = item.product?._id || item._id;
    return pId === product._id;
  });

  const quantity = cartItem ? cartItem.quantity : 0;

  // Check if product is in user's saved wishlist
  useEffect(() => {
    if (user && user.wishlist) {
      const exists = user.wishlist.some((id) => (id._id || id).toString() === product._id.toString());
      setIsWishlisted(exists);
    }
  }, [user, product._id]);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.warning('Product is currently out of stock');
      return;
    }
    addToCart(product, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (quantity < product.stock) {
      updateQuantity(product._id, quantity + 1);
    } else {
      toast.warning(`Only ${product.stock} items available in stock`);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product._id, quantity - 1);
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to save items to your Wishlist!');
      return;
    }

    if (togglingWishlist) return;

    setTogglingWishlist(true);
    try {
      const res = await wishlistService.toggleWishlist(product._id);
      if (res.success) {
        setIsWishlisted(res.action === 'added');
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(product)}
      className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative"
    >
      {/* Top Badges & Wishlist Heart */}
      <div className="flex items-center justify-between z-10 mb-1">
        {/* Discount Badge */}
        {product.discount > 0 ? (
          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.discount}% OFF
          </span>
        ) : (
          <div></div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={togglingWishlist}
          className="w-7 h-7 bg-white/80 backdrop-blur-xs rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-2xs transition-colors cursor-pointer"
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <FiHeart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div className="w-full h-36 flex items-center justify-center p-2 mb-2 overflow-hidden rounded-xl bg-gray-50/50">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Delivery ETA Badge */}
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100/80 w-fit px-1.5 py-0.5 rounded-md mb-1.5">
        <FiClock className="w-3 h-3 text-primary" />
        <span>10 MINS</span>
      </div>

      {/* Product Name & Brand */}
      <div className="mb-2 flex-1">
        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{product.unit || '1 unit'}</p>
      </div>

      {/* Price & Add to Cart Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        {/* Pricing */}
        <div className="flex flex-col leading-none">
          <span className="text-sm font-black text-gray-900">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-[11px] text-gray-400 line-through mt-0.5">₹{product.mrp}</span>
          )}
        </div>

        {/* Add / Quantity Button */}
        {quantity === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="px-3.5 py-1.5 bg-primary-light border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all uppercase cursor-pointer disabled:opacity-50 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
          >
            {product.stock > 0 ? 'ADD' : 'OUT'}
          </button>
        ) : (
          <div className="flex items-center bg-primary text-white rounded-lg px-2 py-1 text-xs font-bold gap-2 shadow-2xs">
            <button type="button" onClick={handleDecrement} className="hover:opacity-80 p-0.5">
              <FiMinus className="w-3 h-3" />
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={handleIncrement} className="hover:opacity-80 p-0.5">
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProductCard;
