import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiKey, FiArrowLeft, FiZap, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import authService from '../../services/authService.js';

/**
 * VerifyOtp Page Component (/verify-otp)
 * 
 * Handles 6-digit Email OTP Verification during account registration.
 * Features:
 * - 60-second Resend OTP Cooldown Timer.
 * - Clear Toastify feedback for valid, invalid, expired, or already-verified OTPs.
 */
function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60); // 60-second cooldown timer for resend OTP

  const { verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown Timer Interval Effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Submit OTP Verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Please enter both your email address and 6-digit OTP code');
      return;
    }

    setSubmitting(true);
    const res = await verifyOtp({ email, otp });
    setSubmitting(false);

    if (res?.success) {
      navigate('/');
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    if (!email) {
      toast.error('Please enter your email address to resend OTP');
      return;
    }

    setResending(true);
    try {
      const res = await authService.resendOtp(email);
      if (res.success) {
        toast.success(res.message || 'New OTP sent to your email!');
        setCooldown(60); // Reset 60s cooldown
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tight">
            <span className="bg-primary text-white p-2 rounded-xl flex items-center justify-center">
              <FiZap className="w-6 h-6" />
            </span>
            Blink<span className="text-primary">it</span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Verify Your Email Address</h2>
          <p className="mt-1 text-sm text-gray-500">
            We sent a 6-digit OTP code to <strong className="text-gray-800">{email || 'your email'}</strong>
          </p>
        </div>

        {/* Verification Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiMail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 6-Digit OTP Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              6-Digit OTP Code
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiKey className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm tracking-widest font-mono text-center text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Verification Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <FiCheckCircle className="w-5 h-5" /> Verify Email & Continue
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Section with Cooldown */}
        <div className="pt-3 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500">Didn't receive the OTP code?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || resending}
            className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              cooldown > 0 || resending
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary hover:underline'
            }`}
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Code'}
          </button>
        </div>

        {/* Back to Login */}
        <div className="pt-2 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default VerifyOtp;
