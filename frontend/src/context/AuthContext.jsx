import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService.js';

// Create Auth Context
const AuthContext = createContext();

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Re-verify authentication on app load if token exists in localStorage
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login handler (Email + Password -> Redirects to Home / Admin)
  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.data);
        toast.success(res.message || `Welcome back, ${res.data.name}! 👋`);
        return { success: true, data: res.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Register handler (Name, Email, Mobile Number, Password -> Redirects to Login)
  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success) {
        // Do NOT auto-login or store token upon signup; prompt user to sign in
        toast.success('Account created successfully. Please sign in.');
        return { success: true, data: res.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      const isDuplicate = errorMsg.toLowerCase().includes('already exists');
      return { success: false, message: errorMsg, isDuplicate };
    }
  };

  // Forgot Password handler
  const forgotPassword = async (email) => {
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        toast.success(res.message);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send password reset OTP';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Reset Password handler
  const resetPassword = async (resetData) => {
    try {
      const res = await authService.resetPassword(resetData);
      if (res.success) {
        toast.success(res.message);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to reset password';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken('');
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        setUser(res.data);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      return { success: false };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
