import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import API from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiUsers,
  FiShield,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiUploadCloud,
  FiToggleLeft,
  FiToggleRight,
  FiAlertTriangle,
  FiMail,
  FiPhone,
  FiCalendar,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * AdminUsers Component (/admin/users)
 * 
 * Customer & User Account Management Suite for Administrators.
 * Features:
 * - View User Details Modal
 * - Edit User Profile (Name, Email, Mobile, Avatar Upload, Role, Status)
 * - Quick Activate / Deactivate Toggle
 * - Delete Account Confirmation Modal (With Self-Deletion Protection)
 * - Real-Time Search & Role Filters
 * - Pagination Support
 */
function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modals state
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // File upload state for Edit User Modal
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form state for Edit User
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
    avatar: '',
  });

  // Fetch Users List from API
  const fetchUsers = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/admin/users?search=${encodeURIComponent(search)}&role=${roleFilter}&page=${targetPage}&limit=10`
      );
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalUsers(res.data.totalUsers || res.data.data.length);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, search, roleFilter]);

  // Open Edit User Modal
  const handleOpenEditModal = (u) => {
    setSelectedFile(null);
    setImagePreview(u.avatar);
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role || 'user',
      isActive: u.isActive !== undefined ? u.isActive : true,
      avatar: u.avatar || '',
    });
  };

  // Handle File Input Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Please select a valid image file (JPG, JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit Edit User Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    // Self action protection check
    if (editingUser._id === currentUser?._id && (!formData.isActive || formData.role !== 'admin')) {
      toast.error('Security Restriction: You cannot deactivate or demote your own logged-in admin account!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('role', formData.role);
      payload.append('isActive', formData.isActive);

      if (selectedFile) {
        payload.append('avatar', selectedFile);
      } else {
        payload.append('avatar', formData.avatar);
      }

      const res = await API.put(`/admin/users/${editingUser._id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('User account updated successfully!');
        setEditingUser(null);
        fetchUsers(page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error updating user profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Active/Inactive Status
  const handleToggleStatus = async (u) => {
    if (u._id === currentUser?._id) {
      toast.error('Security Restriction: You cannot deactivate your own active admin account!');
      return;
    }

    try {
      const res = await API.patch(`/admin/users/${u._id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers(page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle account status');
    }
  };

  // Delete User Confirmation Action
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    if (deletingUser._id === currentUser?._id) {
      toast.error('Security Restriction: You cannot delete your own admin account!');
      setDeletingUser(null);
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.delete(`/admin/users/${deletingUser._id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setDeletingUser(null);
        fetchUsers(page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer & User Accounts</h1>
            <p className="text-xs text-gray-500 font-medium">
              View details, edit profiles, toggle account access, or delete user accounts
            </p>
          </div>
          <div className="bg-primary/10 text-primary font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center gap-2">
            <FiUsers className="w-4 h-4" /> Total Registered Users: {totalUsers}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or mobile number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="user">Customers Only</option>
              <option value="admin">Administrators Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <span className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mb-3"></span>
              <p className="text-xs font-bold">Loading user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FiUsers className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-800">No users match your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-xl">User</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id;

                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-gray-700 font-medium">{u.email}</td>
                        <td className="p-4 text-gray-600 font-mono">{u.phone || 'N/A'}</td>

                        <td className="p-4">
                          {u.role === 'admin' ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                              <FiShield className="w-3 h-3 text-amber-600" /> Admin
                            </span>
                          ) : (
                            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                              <FiUser className="w-3 h-3 text-primary" /> Customer
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {u.isActive !== false ? (
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                              <FiCheckCircle className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                              <FiXCircle className="w-3 h-3" /> Deactivated
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-gray-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* View Details Button */}
                          <button
                            onClick={() => setViewingUser(u)}
                            title="View Details"
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          {/* Edit User Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit Profile"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Inactive Status Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot deactivate self' : u.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              u.isActive !== false
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {u.isActive !== false ? (
                              <FiToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <FiToggleLeft className="w-4 h-4 text-red-500" />
                            )}
                          </button>

                          {/* Delete Account Button */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete self' : 'Delete Account'}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalUsers}
          itemLabel="users"
          onPageChange={handlePageChange}
        />

        {/* 1. VIEW USER DETAILS MODAL */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <FiUser className="text-primary" /> User Account Details
                </h3>
                <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <img
                  src={viewingUser.avatar}
                  alt={viewingUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
                />
                <div>
                  <h4 className="text-base font-black text-gray-900">{viewingUser.name}</h4>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light px-2 py-0.5 rounded-full mt-1">
                    {viewingUser.role}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                  <FiMail className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                    <p className="font-bold text-gray-800">{viewingUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                  <FiPhone className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</p>
                    <p className="font-bold text-gray-800">{viewingUser.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                  <FiCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Joined Date</p>
                    <p className="font-bold text-gray-800">
                      {new Date(viewingUser.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Account Status</span>
                  {viewingUser.isActive !== false ? (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Deactivated
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setViewingUser(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 2. EDIT USER MODAL */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <FiEdit2 className="text-primary" /> Edit Customer Profile
                </h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                
                {/* Profile Picture Upload Box */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Profile Picture (Avatar File Upload)
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-full border border-gray-200 shrink-0" />
                    )}
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-primary text-gray-800 rounded-xl text-xs font-bold shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <FiUploadCloud className="w-4 h-4 text-primary" />
                        {selectedFile ? 'Change Photo File' : 'Upload Avatar Image'}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Role & Account Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Account Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      disabled={editingUser._id === currentUser?._id}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                    >
                      <option value="user">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Account Status *</label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      disabled={editingUser._id === currentUser?._id}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                    >
                      <option value="true">Active Access</option>
                      <option value="false">Deactivated / Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. DELETE USER CONFIRMATION MODAL */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                <FiAlertTriangle />
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900">Delete User Account?</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Are you sure you want to permanently delete the account for{' '}
                  <strong className="text-gray-900">{deletingUser.name}</strong> ({deletingUser.email})?
                </p>
                <p className="text-[11px] text-red-600 font-bold mt-2 bg-red-50 p-2 rounded-xl border border-red-100">
                  ⚠️ Warning: This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminUsers;
