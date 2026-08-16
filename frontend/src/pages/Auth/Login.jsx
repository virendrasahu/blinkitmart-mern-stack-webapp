import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Login Page Component (/login)
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res?.success) {
      navigate(res.data.role === 'admin' ? '/admin' : '/');
    }
  };

  const handleAutofillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else {
      setEmail('john@example.com');
      setPassword('Password123');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
        
        {/* Header Branding */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-3xl font-black tracking-tight">
            <span className="text-[#F8CB46]">blinkit</span>
            <span className="text-[#53B128]">mart</span>
          </Link>
          <h2 className="mt-4 text-xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-1 text-xs text-gray-500 font-medium">Log in to your account to order daily groceries in minutes</p>
        </div>

        {/* 1-Click Demo Accounts Banner */}
        <div className="bg-green-50 border border-green-200 p-3 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-green-800 uppercase tracking-wider">
              ⚡ 1-Click Hiring Demo Accounts
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAutofillDemo('customer')}
              className="flex-1 py-1.5 px-3 bg-white text-green-700 border border-green-300 rounded-xl text-xs font-bold shadow-2xs hover:bg-green-100 transition-colors"
            >
              👤 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleAutofillDemo('admin')}
              className="flex-1 py-1.5 px-3 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-2xs hover:bg-amber-600 transition-colors"
            >
              👑 Admin Demo
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          
          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiMail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiLock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="block w-full pl-10 pr-10 py-3 text-sm font-bold text-gray-900 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                Log In <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <p className="text-center text-xs text-gray-600 pt-2 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Sign up here
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
