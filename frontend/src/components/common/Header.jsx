import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import websiteLogo from '../../assets/WebsiteLogo.png';
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
  FiMenu,
  FiHome,
  FiGrid,
} from 'react-icons/fi';

/**
 * Header Component - Responsive Top Navigation Bar with WebsiteLogo image,
 * Location Selector, Search Bar, Desktop Menu, & Mobile/Tablet Hamburger Drawer.
 */
function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { location, searchQuery, setSearchQuery, setSelectedCategory, setIsCartOpen, setIsLocationModalOpen } = useApp();
  const { cartCount, summary } = useCart();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setSelectedCategory('');
    setSearchQuery('');
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Desktop & Tablet Top Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left: Brand Logo Image & Delivery Location Selector */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            {/* Brand Logo: WebsiteLogo image on mobile/tablet, text form on desktop */}
            <Link to="/" onClick={handleLogoClick} className="flex items-center group shrink-0 cursor-pointer">
              {/* Mobile & Tablet Logo Image (Visible < lg) */}
              <img
                src={websiteLogo}
                alt="BlinkitMart"
                className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 lg:hidden"
              />

              {/* Desktop Text Logo (Visible >= lg) */}
              <div className="hidden lg:flex flex-col leading-none">
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
              className="flex flex-col cursor-pointer group hover:opacity-90 transition-opacity border-l border-gray-200 pl-2 sm:pl-4"
            >
              <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-black uppercase text-gray-900 tracking-wider leading-tight">
                <span className="text-[#53B128] font-bold truncate max-w-[90px] sm:max-w-none">Delivery 10m</span>
                <FiChevronDown className="w-3 h-3 text-gray-500 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-medium truncate max-w-[120px] sm:max-w-[200px]">
                <FiMapPin className="w-3 h-3 text-[#53B128] shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
          </div>

          {/* Center: Search Bar (Hidden on ultra-small mobile, displayed in sub-header or desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xl mx-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "milk", "bread", "chips", "apples"...'
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100/80 border border-transparent rounded-2xl text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Right: Customer Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* User Profile / Auth Button */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover border border-amber-300 shrink-0"
                    />
                    <span className="hidden md:inline font-bold truncate max-w-[100px]">{user?.name}</span>
                    <FiChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {/* Desktop Profile Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser className="w-4 h-4 text-gray-500" /> Account Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiPackage className="w-4 h-4 text-gray-500" /> My Orders
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiHeart className="w-4 h-4 text-red-500" /> Wishlist
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
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm transition-all cursor-pointer font-bold text-xs sm:text-sm shrink-0"
            >
              <div className="relative">
                <FiShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-green-100 font-semibold uppercase tracking-wider">My Cart</span>
                <span className="text-xs font-black">₹{summary?.grandTotal || 0}</span>
              </div>
            </button>

            {/* Mobile/Tablet Hamburger Menu Button (< lg screens) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Shown on < sm screens) */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiSearch className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search "milk", "chips", "apples"...'
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

      </div>

      {/* MOBILE / TABLET SLIDE-OUT NAVIGATION DRAWER (< lg screens) */}
      {mobileMenuOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden animate-in fade-in"
          />

          {/* Slide-In Navigation Drawer */}
          <aside className="fixed inset-y-0 right-0 w-72 bg-white text-gray-900 z-50 flex flex-col justify-between shadow-2xl lg:hidden animate-in slide-in-from-right">
            <div>
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2">
                  <img src={websiteLogo} alt="BlinkitMart" className="h-8 w-auto object-contain" />
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Quick Info Card inside Drawer */}
              <div className="p-4 bg-green-50/40 border-b border-green-100/60">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-gray-800">Welcome to BlinkitMart! 🛒</p>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block w-full py-2 px-4 bg-primary text-white text-xs font-bold rounded-xl text-center shadow-2xs hover:bg-primary-dark transition-all"
                    >
                      Log In / Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Drawer Navigation Links */}
              <nav className="p-4 space-y-1">
                <Link
                  to="/"
                  onClick={handleLogoClick}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiHome className="w-4 h-4 text-primary" /> Home
                </Link>

                <Link
                  to="/products"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiGrid className="w-4 h-4 text-primary" /> All Categories & Products
                </Link>

                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiHeart className="w-4 h-4 text-red-500" /> Wishlist
                </Link>

                <button
                  onClick={() => {
                    closeMobileMenu();
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FiShoppingCart className="w-4 h-4 text-primary" /> My Cart
                  </div>
                  <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                </button>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <FiPackage className="w-4 h-4 text-primary" /> My Orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <FiUser className="w-4 h-4 text-primary" /> Account Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100/80 rounded-xl transition-colors"
                      >
                        <FiShield className="w-4 h-4 text-amber-600" /> Admin Panel
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>

            {/* Mobile Drawer Logout Action */}
            {isAuthenticated && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;
