import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { FiX, FiPlus, FiMinus, FiTrash2, FiClock, FiArrowRight, FiZap } from 'react-icons/fi';

/**
 * CartDrawer Component - Slide-Over Quick Commerce Cart Drawer
 */
function CartDrawer() {
  const { isCartOpen, setIsCartOpen } = useApp();
  const { cartItems, summary, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-100">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-light text-primary rounded-lg flex items-center justify-center font-bold">
                <FiZap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight">My Cart</h3>
                <span className="text-[11px] text-gray-500 font-medium">Delivered in 10 mins</span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-gray-400">
                  🛒
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Your cart is empty</h4>
                <p className="text-xs text-gray-500 mb-6">Explore products and add items to your cart</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary-dark transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Offer Banner */}
                {summary.subtotal < 299 ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-2xl text-xs text-yellow-800 flex items-center gap-2">
                    <FiClock className="text-yellow-600 shrink-0" />
                    <span>
                      Add <strong>₹{299 - summary.subtotal}</strong> more for <strong>FREE Delivery</strong>!
                    </span>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-2xl text-xs text-green-800 flex items-center gap-2">
                    <span>🎉 Congratulations! You unlocked <strong>FREE Delivery</strong>!</span>
                  </div>
                )}

                {/* Items */}
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const pId = product._id || item._id;

                  return (
                    <div
                      key={pId}
                      className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-contain rounded-xl bg-white p-1 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-gray-900 truncate">{product.name}</h5>
                        <p className="text-[11px] text-gray-400 font-medium">{product.unit || '1 unit'}</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-gray-900">₹{product.price}</span>
                          {product.mrp > product.price && (
                            <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Control Buttons */}
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(pId, item.quantity - 1)}
                          className="hover:text-primary p-0.5"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(pId, item.quantity + 1)}
                          className="hover:text-primary p-0.5"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Bill Summary Footer (If items in cart) */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-3">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bill Details</h5>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total (Subtotal)</span>
                  <span className="font-semibold text-gray-900">₹{summary.subtotal}</span>
                </div>

                {summary.productDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Product Savings</span>
                    <span>-₹{summary.productDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  {summary.deliveryFee === 0 ? (
                    <span className="font-bold text-green-600 uppercase text-[10px]">FREE</span>
                  ) : (
                    <span>₹{summary.deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Handling Fee</span>
                  <span>₹{summary.handlingFee}</span>
                </div>

                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-base text-primary">₹{summary.grandTotal}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-between cursor-pointer mt-2"
              >
                <div>
                  <span className="text-xs text-green-100 font-semibold block text-left">Total: ₹{summary.grandTotal}</span>
                  <span className="text-sm font-black">Proceed to Checkout</span>
                </div>
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
