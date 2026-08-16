import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import addressService from '../../services/addressService.js';
import paymentService, { loadRazorpayScript } from '../../services/paymentService.js';
import orderService from '../../services/orderService.js';
import {
  FiMapPin,
  FiPlus,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiLock,
  FiClock,
  FiArrowRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * Checkout Page Component (/checkout)
 */
function Checkout() {
  const { cartItems, summary, clearCart } = useCart();
  const { user } = useAuth();
  const { setIsLocationModalOpen, activeAddress, savedAddresses, fetchAddresses } = useApp();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch saved delivery addresses
  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true);
      await fetchAddresses();
      setLoading(false);
    };
    loadAddresses();
  }, []);

  // Sync selectedAddress with activeAddress or default address
  useEffect(() => {
    if (activeAddress && typeof activeAddress === 'object') {
      setSelectedAddress(activeAddress);
    } else if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [activeAddress, savedAddresses]);

  // Redirect to home if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xs border border-gray-100 max-w-md w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🛒
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-xs text-gray-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Master Order Submission Handler
  const submitOrderToBackend = async (payMethod, payDetails = {}) => {
    try {
      const orderPayload = {
        shippingAddress: {
          fullName: selectedAddress.fullName || user?.name || 'Customer',
          phone: selectedAddress.phone || user?.phone || '9876543210',
          houseNo: selectedAddress.houseNo || 'Flat/House',
          street: selectedAddress.street || 'Main Street',
          area: selectedAddress.area || 'Area',
          city: selectedAddress.city || 'City',
          state: selectedAddress.state || 'State',
          pincode: selectedAddress.pincode || '122001',
          landmark: selectedAddress.landmark || '',
        },
        paymentMethod: payMethod === 'razorpay' ? 'RAZORPAY' : 'COD',
        paymentDetails: payDetails,
      };

      const orderRes = await orderService.createOrder(orderPayload);
      if (orderRes.success) {
        toast.success('Order placed successfully! 🚀');
        await clearCart();
        navigate('/orders');
      } else {
        toast.error(orderRes.message || 'Order creation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Error placing order');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      setIsLocationModalOpen(true);
      return;
    }

    setProcessingPayment(true);

    try {
      if (paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Check internet connection.');
          setProcessingPayment(false);
          return;
        }

        const res = await paymentService.createRazorpayOrder(summary.grandTotal);
        if (!res.success) {
          toast.error(res.message || 'Failed to initiate Razorpay payment');
          setProcessingPayment(false);
          return;
        }

        const { orderId, amount, currency, keyId } = res.data;

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'Blinkit Clone Quick Commerce',
          description: 'Grocery Order Payment (Test Mode)',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
          order_id: orderId,
          prefill: {
            name: user?.name || selectedAddress.fullName,
            email: user?.email || '',
            contact: selectedAddress.phone,
          },
          theme: {
            color: '#0c831f',
          },
          handler: async function (response) {
            toast.info('Verifying payment signature with server...');
            try {
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await submitOrderToBackend('razorpay', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                });
              } else {
                toast.error('Payment signature verification failed');
                setProcessingPayment(false);
              }
            } catch (verifyErr) {
              toast.error('Payment verification failed');
              setProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.info('Payment cancelled');
              setProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

      } else if (paymentMethod === 'cod') {
        await submitOrderToBackend('cod');
      }
    } catch (error) {
      toast.error(error.message || 'Error processing order');
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiLock className="text-primary" /> Checkout & Order Review
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Select delivery address and payment option
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Address & Payment Option */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Delivery Address Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Select Delivery Address
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add / Change Location
                </button>
              </div>

              {loading ? (
                <div className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
              ) : savedAddresses.length === 0 && !selectedAddress ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs text-center">
                  <p className="font-semibold mb-2">No saved delivery address found.</p>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                  >
                    + Pick Location on Map
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddress?._id === addr._id;

                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-green-50/50 border-primary shadow-xs'
                            : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                            {addr.addressType}
                          </span>
                          {isSelected && <FiCheckCircle className="text-primary w-5 h-5" />}
                        </div>

                        <h4 className="text-xs font-bold text-gray-900">{addr.fullName}</h4>
                        <p className="text-xs text-gray-600 font-medium mt-1 leading-snug">
                          {addr.fullAddress || `${addr.houseNo}, ${addr.street}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">📞 {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Order Items Review */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Order Items ({cartItems.length} items)
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  return (
                    <div key={product._id || item._id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-contain bg-gray-50 p-1 rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-gray-900 truncate">{product.name}</h5>
                          <span className="text-[11px] text-gray-400">{product.unit || '1 unit'} × {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-900">₹{product.price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment Method Choice */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'razorpay'
                      ? 'bg-green-50/50 border-primary shadow-xs'
                      : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <FiCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Online Payment</h4>
                    <p className="text-[11px] text-gray-500">UPI, Cards, NetBanking (Razorpay Test Mode)</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'cod'
                      ? 'bg-green-50/50 border-primary shadow-xs'
                      : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <FiDollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Cash on Delivery</h4>
                    <p className="text-[11px] text-gray-500">Pay cash upon 10-minute doorstep arrival</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order CTA */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs h-fit space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Price Details</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
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

            {/* Selected Address Preview */}
            {selectedAddress && (
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Delivering to</span>
                <p className="font-bold text-gray-900 truncate">{selectedAddress.fullName}</p>
                <p className="text-gray-500 text-[11px] truncate">
                  {selectedAddress.fullAddress || `${selectedAddress.houseNo}, ${selectedAddress.street}, ${selectedAddress.city}`}
                </p>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={processingPayment}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processingPayment ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  Pay & Place Order • ₹{summary.grandTotal} <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-[11px] text-gray-400 font-medium">
              <FiClock className="text-primary" /> Guaranteed 10-Minute Doorstep Delivery
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
