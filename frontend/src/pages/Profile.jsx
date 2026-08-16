import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiPackage,
  FiHeart,
  FiEdit3,
  FiSave,
  FiLogOut,
  FiCheckCircle,
  FiCamera,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';

/**
 * User Profile Page Component (/profile)
 * 
 * Features:
 * - Direct File Upload for Profile Picture to Cloudinary via Multer.
 * - Live Preview of selected file before uploading.
 * - Client-side File Validation (JPG, JPEG, PNG, WEBP, <= 5MB).
 * - Edit Full Name and Delivery Mobile Number.
 */
function Profile() {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync component state with user context updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Clean up Object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle Profile Picture File Selection & Validation
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. File Type Validation (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid file type! Please select a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    // 2. File Size Validation (Max 5 MB)
    const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
    if (file.size > maxSize) {
      toast.error('File size too large! Maximum image size is 5MB.');
      return;
    }

    // 3. Set Selected File & Generate Live Blob Preview URL
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    toast.info(`Selected "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  /**
   * Cancel Selected Image File
   */
  const handleCancelFile = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Submit Profile & Avatar Changes via Multipart FormData
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Build FormData payload for file upload + text fields
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);

      if (selectedFile) {
        payload.append('avatar', selectedFile);
      }

      const res = await updateProfile(payload);
      
      if (res?.success) {
        setIsEditing(false);
        setSelectedFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Profile</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your personal details and upload a custom profile picture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Sidebar Card: User Overview & Avatar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            
            {/* Avatar Display with Upload Overlay Button */}
            <div className="relative mb-4 group">
              <img
                src={
                  imagePreview ||
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={user?.name || 'User Avatar'}
                className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-sm transition-all"
              />
              
              {/* Trigger File Input Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white p-2.5 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Upload Profile Picture"
              >
                <FiCamera className="w-4 h-4" />
              </button>

              {/* Hidden HTML File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
            </div>

            {/* Selected File Badge / Cancel Option */}
            {selectedFile && (
              <div className="mb-3 bg-green-50 border border-green-200 px-3 py-1.5 rounded-2xl flex items-center gap-2 max-w-full">
                <span className="text-[11px] font-bold text-green-900 truncate">
                  Previewing: {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleCancelFile}
                  className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer shrink-0"
                  title="Remove selection"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <h2 className="text-lg font-black text-gray-900">{user?.name || 'Customer Name'}</h2>
            <p className="text-xs text-gray-500 font-medium truncate max-w-full">{user?.email}</p>

            <span className="inline-block mt-2 text-[10px] font-bold text-primary bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.role === 'admin' ? '👑 Administrator' : '⚡ Quick-Commerce Member'}
            </span>

            {/* Quick Navigation Buttons */}
            <div className="w-full mt-6 space-y-2 pt-4 border-t border-gray-100">
              <Link
                to="/orders"
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors"
              >
                <FiPackage className="w-4 h-4 text-primary" /> My Orders
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors"
              >
                <FiHeart className="w-4 h-4 text-red-500" /> Wishlist
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 transition-colors"
                >
                  <FiShield className="w-4 h-4 text-amber-600" /> Admin Dashboard
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 transition-colors cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>

          {/* Right Main Card: Personal Details Form & Upload Controls */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleCancelFile();
                  }
                  setIsEditing(!isEditing);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FiEdit3 className="w-3.5 h-3.5 text-primary" />
                {isEditing ? 'Cancel' : 'Edit Information'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Profile Picture Upload Section */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Upload Profile Picture
                </label>

                <div className="flex items-center gap-4">
                  {/* Image Thumbnail */}
                  <img
                    src={
                      imagePreview ||
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                    }
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                  />

                  {/* Choose File Button */}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-primary text-gray-800 rounded-xl text-xs font-bold shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <FiUploadCloud className="w-4 h-4 text-primary" />
                      {selectedFile ? 'Change Selected Photo' : 'Upload New Photo'}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supports JPG, JPEG, PNG, or WEBP (Max 5MB). Uploads securely to Cloudinary.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiUser className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 bg-transparent disabled:bg-gray-50 disabled:text-gray-500 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address (Read-Only) */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative rounded-2xl shadow-2xs border border-gray-200">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile Number (For Delivery Updates)
                </label>
                <div className="relative rounded-2xl shadow-2xs border border-gray-200 focus-within:border-primary">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiPhone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="block w-full pl-10 pr-4 py-3 text-xs font-semibold text-gray-900 bg-transparent disabled:bg-gray-50 disabled:text-gray-500 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Save Profile Changes Button */}
              {(isEditing || selectedFile) && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" /> Save Profile & Photo
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default Profile;
