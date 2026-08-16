import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Register Page Component (/register)
 */
function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (duplicateMessage) {
      setDuplicateMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDuplicateMessage('');

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please re-type your confirm password.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    setSubmitting(false);

    if (res?.success) {
      navigate('/login');
    } else if (res?.isDuplicate) {
      setDuplicateMessage(res.message || 'An account with this email/mobile number already exists.');
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
          <h2 className="mt-4 text-xl font-black text-gray-900 tracking-tight">Create an Account</h2>
          <p className="mt-1 text-xs text-gray-500 font-medium">Get daily groceries delivered to your door step in minutes</p>
        </div>

        {/* Conditional Banner: Displayed ONLY when duplicate email/phone is submitted */}
        {duplicateMessage && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 animate-fade-in">
            <FiAlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900 leading-tight">
                {duplicateMessage}
              </p>
              <p className="text-xs text-amber-800 font-medium">
                Already registered?{' '}
                <Link to="/login" className="font-bold underline text-amber-900 hover:text-black">
                  Click here to Log In
                </Link>{' '}
                with your existing account.
              </p>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiUser className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiMail className="h-5 w-5" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Number (For Delivery Updates)
            </label>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiPhone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiLock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="block w-full pl-10 pr-10 py-3 text-xs font-semibold text-gray-900 focus:outline-none bg-transparent"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiLock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none bg-transparent"
              />
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
                Create Account <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="text-center text-xs text-gray-600 pt-2 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
