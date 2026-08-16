import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import orderService from '../../services/orderService.js';
import { useCart } from '../../context/CartContext.jsx';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiRotateCcw,
  FiMapPin,
  FiChevronRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * MyOrders Page Component (/orders) - Order History & Real-Time Tracking with Pagination
 */
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const { addToCart } = useCart();

  const fetchOrders = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders({ page: targetPage, limit: 5 });
      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalOrders(res.totalOrders || res.data.length);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await orderService.cancelOrder(orderId);
      if (res.success) {
        toast.success('Order cancelled successfully! Stock restored.');
        fetchOrders(page);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    }
  };

  const handleReorder = (orderItems) => {
    orderItems.forEach((item) => {
      addToCart(
        {
          _id: item.product,
          name: item.name,
          price: item.price,
          mrp: item.mrp,
          stock: 50,
          image: item.image,
          unit: item.unit,
        },
        item.quantity
      );
    });
    toast.success('Reorder items added to cart!');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper status color pill
  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full uppercase">Delivered</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase">Out for Delivery</span>;
      case 'PREPARING':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full uppercase">Preparing</span>;
      case 'CONFIRMED':
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-3 py-1 rounded-full uppercase">Confirmed</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-xs font-black px-3 py-1 rounded-full uppercase">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-black px-3 py-1 rounded-full uppercase">Placed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiPackage className="text-primary" /> My Orders ({totalOrders})
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse h-48"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto my-12 shadow-2xs">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-gray-400">
              📦
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Placed Yet</h3>
            <p className="text-xs text-gray-500 mb-6">Your order history will appear here once you make your first order.</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="bg-gray-50/70 p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900">{order.orderId}</span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Payment: <strong className="text-gray-800 uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                      <span className="text-base font-black text-gray-900">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Tracking Progress Timeline (If active order) */}
                  {order.orderStatus !== 'CANCELLED' && (
                    <div className="px-6 py-4 border-b border-gray-100 bg-green-50/20">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 max-w-2xl mx-auto">
                        <div className={`flex items-center gap-1 ${['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'text-primary' : ''}`}>
                          <FiCheckCircle /> Placed
                        </div>
                        <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
                        <div className={`flex items-center gap-1 ${['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'text-primary' : ''}`}>
                          <FiCheckCircle /> Confirmed
                        </div>
                        <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
                        <div className={`flex items-center gap-1 ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'text-primary' : ''}`}>
                          <FiTruck /> On the Way
                        </div>
                        <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
                        <div className={`flex items-center gap-1 ${order.orderStatus === 'DELIVERED' ? 'text-primary' : ''}`}>
                          <FiCheckCircle /> Delivered
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items & Address Details */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Items List */}
                    <div className="md:col-span-2 space-y-3">
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-gray-500">{item.unit} × {item.quantity} • ₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Destination & Action */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between text-xs space-y-3">
                      <div>
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivered To</h5>
                        <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                        <p className="text-gray-600 mt-0.5 leading-snug">
                          {order.shippingAddress.houseNo}, {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-1">📞 {order.shippingAddress.phone}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex gap-2">
                        {['PLACED', 'CONFIRMED'].includes(order.orderStatus) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="flex-1 py-2 px-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}

                        <button
                          onClick={() => handleReorder(order.items)}
                          className="flex-1 py-2 px-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiRotateCcw className="w-3.5 h-3.5" /> Reorder
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalOrders}
              itemLabel="orders"
              onPageChange={handlePageChange}
            />
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default MyOrders;
