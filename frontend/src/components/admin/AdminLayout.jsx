import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiGrid,
  FiBox,
  FiFolder,
  FiShoppingBag,
  FiUsers,
  FiLogOut,
  FiExternalLink,
  FiShield,
} from 'react-icons/fi';

/**
 * AdminLayout Component - Sidebar Navigation & Top Header for Admin Dashboard
 */
function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: FiGrid },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Categories', path: '/admin/categories', icon: FiFolder },
    { name: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo Branding without icon box */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div>
              <span className="text-xl font-black tracking-tight block leading-none">
                <span className="text-[#F8CB46]">blinkit</span>
                <span className="text-[#53B128]">mart</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-1 block">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span>Customer Website</span>
            <FiExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            <FiShield className="text-amber-500 w-5 h-5" />
            <h2 className="text-sm font-bold text-gray-800 hidden sm:block">Quick Commerce Management Suite</h2>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-amber-300"
            />
            <div className="text-left text-xs">
              <p className="font-bold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-amber-600 font-semibold uppercase">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>

      </div>
    </div>
  );
}

export default AdminLayout;
