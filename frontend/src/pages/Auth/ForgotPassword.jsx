import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiKey, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * ForgotPassword Page Component (/forgot-password)
 */
function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (step === 2 && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res?.success) {
      setStep(2);
      setCooldown(60);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await resetPassword({
      email: email.trim(),
      otp: otp.trim(),
      newPassword,
    });
    setLoading(false);

    if (res?.success) {
      navigate('/login');
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);
    if (res?.success) {
      setCooldown(60);
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
          <h2 className="mt-4 text-xl font-black text-gray-900 tracking-tight">
            {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
          </h2>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            {step === 1
              ? 'Enter your registered email address to receive a 6-digit reset OTP'
              : `We sent a 6-digit reset OTP code to ${email}`}
          </p>
        </div>

        {/* STEP 1: REQUEST RESET OTP */}
        {step === 1 && (
          <form className="mt-4 space-y-4" onSubmit={handleSendResetOtp}>
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

            <button
              type="submit"
              disabled={loading || !email.includes('@')}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                'Send Reset OTP'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
        {step === 2 && (
          <form className="mt-4 space-y-4" onSubmit={handleResetPasswordSubmit}>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                6-Digit Reset OTP Code
              </label>
              <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiKey className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="block w-full pl-10 pr-4 py-3 text-center text-lg font-black font-mono tracking-widest text-gray-900 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || !newPassword}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  Reset Password <FiCheckCircle className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:underline'
                }`}
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend Reset OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
