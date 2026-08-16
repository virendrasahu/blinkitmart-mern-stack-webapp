import React, { useState } from 'react';
import { FiX, FiClock, FiPlus, FiMinus, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';

/**
 * ProductDetailsModal Component - Detailed View Popup
 */
function ProductDetailsModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image & Badges */}
        <div className="w-full md:w-1/2 p-6 bg-gray-50 flex flex-col items-center justify-center relative">
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              {product.discount}% OFF
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-64 object-contain"
          />
        </div>

        {/* Right Side: Information & Action */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            {/* Brand & Category */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <span>{product.brand}</span>
              {product.category?.name && (
                <>
                  <span>•</span>
                  <span>{product.category.name}</span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h2 className="text-lg font-black text-gray-900 leading-snug mb-1">
              {product.name}
            </h2>

            {/* Weight / Unit */}
            <p className="text-xs font-semibold text-gray-500 mb-3">{product.unit || '1 unit'}</p>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-black px-2 py-0.5 rounded-md">
                <FiStar className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating || 4.5}</span>
              </div>
              <span className="text-xs text-gray-400">({product.numReviews || 12} reviews)</span>
            </div>

            {/* Price & MRP */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-gray-400 line-through">MRP ₹{product.mrp}</span>
              )}
              <span className="text-xs text-green-600 font-bold">(Inclusive of all taxes)</span>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Details</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Delivery Guarantees */}
            <div className="bg-green-50/60 p-3 rounded-xl border border-green-100 flex items-center gap-3 mb-6">
              <FiClock className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 block">Delivered in 10 minutes</span>
                <span className="text-gray-500">Shipped fresh from your nearest dark store</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Add Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden font-bold">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all text-center cursor-pointer"
            >
              Add {quantity} to Cart • ₹{product.price * quantity}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ProductDetailsModal;
