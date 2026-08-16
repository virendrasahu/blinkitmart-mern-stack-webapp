import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import API from '../../services/api.js';
import { FiShoppingBag, FiCheckCircle, FiClock, FiTruck, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * AdminOrders Component (/admin/orders) with Pagination
 */
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/orders/all?page=${targetPage}&limit=10`);
      if (res.data.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalOrders(res.data.totalOrders || res.data.data.length);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(page);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Fulfillment & Logistics</h1>
          <p className="text-xs text-gray-500 font-medium">Update real-time delivery status for customer orders</p>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 rounded-l-xl">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Bill</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{order.orderId}</td>
                    
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                      <p className="text-[11px] text-gray-400">📞 {order.shippingAddress?.phone}</p>
                    </td>

                    <td className="p-4 text-gray-700">{order.items?.length || 0} items</td>

                    <td className="p-4 font-black text-gray-900">₹{order.totalAmount}</td>

                    <td className="p-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-primary cursor-pointer"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="p-4 text-gray-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </AdminLayout>
  );
}

export default AdminOrders;
