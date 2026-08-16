import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight, FiShield } from 'react-icons/fi';

/**
 * Cart Page Component (/cart)
 */
function Cart() {
  const { cartItems, summary, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiShoppingBag className="text-primary" /> Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto my-12 shadow-2xs">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-gray-400">
              🛒
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
            <p className="text-xs text-gray-500 mb-6">Looks like you haven't added any groceries to your cart yet.</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all"
            >
              Explore Fresh Groceries
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Items Column */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => {
                const product = item.product || item;
                const pId = product._id || item._id;

                return (
                  <div
                    key={pId}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{product.unit || '1 unit'}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black text-gray-900">₹{product.price}</span>
                          {product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Remove Button */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800">
                        <button
                          onClick={() => updateQuantity(pId, item.quantity - 1)}
                          className="hover:text-primary"
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(pId, item.quantity + 1)}
                          className="hover:text-primary"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(pId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Summary Column */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs h-fit space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Bill Summary</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-gray-900">₹{summary.subtotal}</span>
                </div>

                {summary.productDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Product Savings</span>
                    <span>-₹{summary.productDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  {summary.deliveryFee === 0 ? (
                    <span className="font-bold text-green-600 uppercase text-[10px]">FREE</span>
                  ) : (
                    <span>₹{summary.deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Handling Charge</span>
                  <span>₹{summary.handlingFee}</span>
                </div>

                <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{summary.grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout <FiArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 justify-center text-[11px] text-gray-400 font-medium">
                <FiShield className="text-primary" /> Safe & Secure Checkout Guarantee
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Cart;
