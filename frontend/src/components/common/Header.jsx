import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiShield,
  FiX,
  FiHeart,
} from 'react-icons/fi';

/**
 * Header Component - Sticky Top Navigation Bar with BlinkitMart Logo & Location Selector
 */
function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { location, searchQuery, setSearchQuery, setIsCartOpen, setIsLocationModalOpen } = useApp();
  const { cartCount, summary } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Delivery Location Selector */}
          <div className="flex items-center gap-6 shrink-0">
            {/* BlinkitMart Brand Logo without Lightning Icon */}
            <Link to="/" className="flex items-center group">
              <div className="flex flex-col leading-none">
                <span className="text-2xl sm:text-3xl font-black tracking-tight">
                  <span className="text-[#F8CB46]">blinkit</span>
                  <span className="text-[#53B128]">mart</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded-xs mt-0.5 w-fit">
                  10 minutes
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector Button (Blinkit Style) */}
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex flex-col border-l border-gray-200 pl-6 cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-1 text-xs font-black uppercase text-gray-900 tracking-wider">
                <span className="text-[#53B128] font-bold">Delivery in 10 mins</span>
                <FiChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium truncate max-w-[220px]">
                <FiMapPin className="w-3.5 h-3.5 text-[#53B128] shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
          </div>

          {/* Real-Time Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "milk", "bread", "chips", "apples"...'
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Right Action Buttons (User Profile & Cart) */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* User Profile / Auth Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-800 cursor-pointer"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary/20"
                  />
                  <span className="hidden lg:inline max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full mt-1 uppercase">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiPackage className="w-4 h-4 text-primary" /> My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiHeart className="w-4 h-4 text-red-500" /> Wishlist
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="w-4 h-4 text-primary" /> Profile Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <FiShield className="w-4 h-4 text-amber-600" /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <FiLogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <FiUser className="w-4 h-4 text-gray-600" /> Log In
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm transition-all cursor-pointer font-bold text-sm"
            >
              <div className="relative">
                <FiShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-green-100 font-semibold uppercase tracking-wider">My Cart</span>
                <span className="text-xs font-black">₹{summary?.grandTotal || 0}</span>
              </div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
