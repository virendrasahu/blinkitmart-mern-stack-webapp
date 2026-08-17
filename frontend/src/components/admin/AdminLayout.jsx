import React, { useState } from 'react';
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
  FiMenu,
  FiX,
} from 'react-icons/fi';

const DEFAULT_ADMIN_AVATAR =
  'https://res.cloudinary.com/doyvz7zrp/image/upload/v1786890614/Gemini_Generated_Image_opzy6oopzy6oopzy_-_Copy_h161an.png';

/**
 * AdminLayout Component - Responsive Sidebar Navigation & Top Header for Admin Dashboard
 */
function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: FiGrid },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Categories', path: '/admin/categories', icon: FiFolder },
    { name: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">

      {/* 1. Desktop Left Sidebar (Visible on >= 768px screens) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo Branding */}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
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

      {/* 2. Mobile & Tablet Slide-Out Navigation Drawer (< 768px screens) */}
      {mobileMenuOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden animate-in fade-in"
          />

          {/* Mobile Drawer Content */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-50 flex flex-col justify-between shadow-2xl md:hidden animate-in slide-in-from-left">
            <div>
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black tracking-tight block leading-none">
                    <span className="text-[#F8CB46]">blinkit</span>
                    <span className="text-[#53B128]">mart</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-1 block">
                    Admin Panel
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-gray-800 space-y-2">
              <Link
                to="/"
                onClick={handleNavClick}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <span>Customer Website</span>
                <FiExternalLink className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
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
        </>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            {/* Hamburger Toggle Button (Mobile & Tablet Only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors cursor-pointer mr-1"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            <FiShield className="text-amber-500 w-5 h-5 shrink-0" />
            <h2 className="text-sm font-bold text-gray-800 truncate max-w-[180px] sm:max-w-none">
              Quick Commerce Management Suite
            </h2>
          </div>

          {/* Admin User Info Profile Badge with Cloudinary Avatar Image */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={user?.avatar || DEFAULT_ADMIN_AVATAR}
              alt={user?.name || 'Blinkit Admin'}
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow-2xs shrink-0"
            />
            <div className="text-left text-xs hidden sm:block">
              <p className="font-bold text-gray-900 leading-tight truncate max-w-[120px]">{user?.name || 'Blinkit Admin'}</p>
              <p className="text-[10px] text-amber-600 font-semibold uppercase">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>

      </div>
    </div>
  );
}

export default AdminLayout;
