import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiKey, FiUser, FiPhone, FiZap, FiRefreshCw, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * EmailLogin Page Component (/login & /register)
 * 
 * Flow:
 * - Step 1: Input Email Address -> Send 6-Digit Email OTP
 * - Step 2: Input 6-Digit Email OTP -> POST /api/auth/verify-otp (Single-use OTP verification!)
 * - Step 3 (New Users): Input Name & Mobile Number -> POST /api/auth/complete-profile (Uses temp verificationToken)
 */
function EmailLogin() {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Enter Profile (Name & Phone for New Users)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [showDemoLogin, setShowDemoLogin] = useState(false);

  // Demo Credentials state for email/password fallback
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');

  const { sendEmailOtp, verifyEmailOtp, completeAccountProfile, resendEmailOtp, login } = useAuth();
  const navigate = useNavigate();

  // Cooldown timer interval effect for Resend OTP button
  useEffect(() => {
    let timer;
    if (step === 2 && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Step 1: Send 6-Digit Email OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(email.trim());
    setLoading(false);

    if (res?.success) {
      setStep(2);
      setCooldown(60);
    }
  };

  // Step 2: Verify 6-Digit Email OTP (Verifies OTP exactly ONCE!)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    const res = await verifyEmailOtp({ email: email.trim(), otp: otp.trim() });
    setLoading(false);

    if (res?.success) {
      if (res.isNewUser && res.verificationToken) {
        // New user: Save signed verificationToken and move to Step 3 for Profile Setup
        setVerificationToken(res.verificationToken);
        setStep(3);
      } else {
        // Existing user: Logged in directly
        navigate('/');
      }
    }
  };

  // Step 3: Complete Account Setup for New Users (Uses verificationToken, NO duplicate OTP check)
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your mobile number for delivery notifications');
      return;
    }
    if (!verificationToken) {
      toast.error('Verification session expired. Please verify your email OTP again.');
      setStep(1);
      return;
    }

    setLoading(true);
    const res = await completeAccountProfile({
      verificationToken,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    setLoading(false);

    if (res?.success) {
      navigate('/');
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    const res = await resendEmailOtp(email);
    setLoading(false);
    if (res?.success) {
      setCooldown(60);
    }
  };

  // Demo Password Login Handler (For Admin / Customer reviewer testing)
  const handleDemoLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(demoEmail, demoPassword);
    setLoading(false);
    if (res?.success) {
      navigate(res.data.role === 'admin' ? '/admin' : '/');
    }
  };

  const handleAutofillDemo = (role) => {
    setShowDemoLogin(true);
    if (role === 'admin') {
      setDemoEmail('admin@example.com');
      setDemoPassword('Admin@123');
    } else {
      setDemoEmail('john@example.com');
      setDemoPassword('Password123');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
        
        {/* Top Branding Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tight">
            <span className="bg-primary text-white p-2 rounded-xl flex items-center justify-center">
              <FiZap className="w-6 h-6" />
            </span>
            Blink<span className="text-primary">it</span>
          </Link>
          <h2 className="mt-4 text-xl font-black text-gray-900 tracking-tight">
            {showDemoLogin
              ? 'Demo Account Login'
              : step === 1
              ? 'India\'s Last Minute App'
              : step === 2
              ? 'Verify Email OTP'
              : 'Complete Your Account'}
          </h2>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            {showDemoLogin
              ? 'Sign in with demo credentials for hiring review'
              : step === 1
              ? 'Log in or sign up with your email address'
              : step === 2
              ? `Enter the 6-digit OTP code sent to ${email}`
              : 'Tell us your name and mobile number to complete setup'}
          </p>
        </div>

        {/* 1-Click Demo Login Toggle Options */}
        {!showDemoLogin && step === 1 && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-green-800 uppercase tracking-wider">
                ⚡ 1-Click Hiring Demo Accounts
              </span>
              <button
                type="button"
                onClick={() => setShowDemoLogin(true)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Password Login
              </button>
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
        )}

        {/* Demo Password Login Form */}
        {showDemoLogin ? (
          <form className="mt-4 space-y-4" onSubmit={handleDemoLoginSubmit}>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-xs focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={demoPassword}
                onChange={(e) => setDemoPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-xs focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark"
            >
              {loading ? 'Logging in...' : 'Sign In with Password'}
            </button>
            <button
              type="button"
              onClick={() => setShowDemoLogin(false)}
              className="w-full text-center text-xs text-gray-500 font-semibold hover:underline"
            >
              ← Back to Email OTP Login
            </button>
          </form>
        ) : (
          <>
            {/* STEP 1: ENTER EMAIL ADDRESS */}
            {step === 1 && (
              <form className="mt-4 space-y-4" onSubmit={handleSendOtp}>
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
                    <>
                      Send OTP <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: ENTER 6-DIGIT EMAIL OTP */}
            {step === 2 && (
              <form className="mt-4 space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    6-Digit Email OTP Code
                  </label>
                  <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="block w-full px-4 py-3 text-center text-xl font-black font-mono tracking-widest text-gray-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      Verify & Continue <FiCheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP */}
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
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Code'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-xs text-gray-500 font-semibold hover:underline"
                >
                  ← Edit Email Address ({email})
                </button>
              </form>
            )}

            {/* STEP 3: NEW USER NAME & MOBILE NUMBER PROFILE */}
            {step === 3 && (
              <form className="mt-4 space-y-4" onSubmit={handleCompleteProfile}>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative rounded-2xl shadow-2xs border border-gray-200">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 text-xs font-semibold border-none rounded-2xl focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Number * (For Delivery Updates)
                  </label>
                  <div className="relative rounded-2xl shadow-2xs border border-gray-200">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FiPhone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-3 text-xs font-semibold border-none rounded-2xl focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim() || !phone.trim()}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  ) : (
                    'Complete Account Setup'
                  )}
                </button>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default EmailLogin;
