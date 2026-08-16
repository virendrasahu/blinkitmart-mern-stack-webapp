import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import adminService from '../../services/adminService.js';
import {
  FiDollarSign,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiAlertTriangle,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

/**
 * AdminDashboard Component (/admin)
 */
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Live store metrics, revenue analytics, and inventory health
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse border border-gray-200"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Revenue */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">₹{stats?.totalRevenue || 0}</h3>
                  <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 mt-1">
                    <FiTrendingUp /> Verified Orders
                  </span>
                </div>
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  <FiDollarSign />
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{stats?.totalOrders || 0}</h3>
                  <span className="text-[10px] text-gray-500 font-medium mt-1 block">
                    {stats?.pendingOrders || 0} pending • {stats?.deliveredOrders || 0} delivered
                  </span>
                </div>
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  <FiShoppingBag />
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Inventory</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{stats?.totalProducts || 0}</h3>
                  <span className="text-[10px] text-gray-500 font-medium mt-1 block">
                    Across {stats?.totalCategories || 0} departments
                  </span>
                </div>
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  <FiBox />
                </div>
              </div>

              {/* Low Stock Warning */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Low Stock Items</span>
                  <h3 className="text-2xl font-black text-red-600 mt-1">{stats?.lowStockCount || 0}</h3>
                  <span className="text-[10px] font-bold text-red-500 mt-1 block">
                    Stock &lt;= 10 warning
                  </span>
                </div>
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  <FiAlertTriangle />
                </div>
              </div>

            </div>

            {/* Rule 26: Low Stock Inventory Warning Alert Banner */}
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                  <FiAlertTriangle className="text-amber-600 w-5 h-5" />
                  <span>Low Stock Warning Alert (Rule 26)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.lowStockProducts.map((prod) => (
                    <div key={prod._id} className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                        <span className="inline-block text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md mt-0.5">
                          Stock: {prod.stock} Low Stock Warning
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Activity Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Recent Orders Activity</h3>
                <Link to="/admin/orders" className="text-xs font-bold text-primary hover:underline">
                  View All Orders →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-xl">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {stats?.recentOrders?.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-900">{order.orderId}</td>
                        <td className="p-3 text-gray-700">{order.shippingAddress?.fullName}</td>
                        <td className="p-3 uppercase font-semibold text-gray-600">{order.paymentMethod}</td>
                        <td className="p-3 font-black text-gray-900">₹{order.totalAmount}</td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
