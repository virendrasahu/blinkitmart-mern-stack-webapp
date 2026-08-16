import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';

/**
 * @desc    Get Admin Dashboard Stats & Key Metrics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin Only)
 */
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      lowStockCount,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] } }),
      Order.countDocuments({ orderStatus: 'DELIVERED' }),
      Product.countDocuments({ stock: { $lte: 10 } }),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Product.find({ stock: { $lte: 10 } }).select('name brand category price stock unit image').limit(10),
    ]);

    const revenueAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        deliveredOrders,
        lowStockCount,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching admin dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all registered users for Admin panel with search, role filter & pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -resetPasswordOtp -resetPasswordOtpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      currentPage: page,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching registered users list',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single user details by ID for Admin View
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin Only)
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordOtp -resetPasswordOtpExpiry');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user details by Admin (Name, Email, Mobile Number, Avatar, Role, Active Status)
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin Only)
 */
export const updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const targetUserId = req.params.id;

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Security Rule: Prevent admin from deactivating or demoting their own logged-in account
    if (req.user.id === targetUserId) {
      if (isActive === 'false' || isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'Security Restriction: You cannot deactivate your own active admin account!',
        });
      }
      if (role && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Security Restriction: You cannot remove admin role from your own account!',
        });
      }
    }

    // Check duplicate email if changed
    if (email && email.trim().toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: `An account with email ${email} already exists!`,
        });
      }
      user.email = email.trim().toLowerCase();
    }

    // Check duplicate phone if changed
    if (phone && phone.trim() !== user.phone) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: `An account with mobile number ${phone} already exists!`,
        });
      }
      user.phone = phone.trim();
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (isActive !== undefined) {
      user.isActive = isActive === 'true' || isActive === true;
    }

    // Process Avatar File Upload if provided via Multer
    if (req.file) {
      const cloudinaryResult = await uploadImageClodinary(req.file);
      if (cloudinaryResult && cloudinaryResult.secure_url) {
        user.avatar = cloudinaryResult.secure_url;
      }
    } else if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Quick Activate / Deactivate user account status
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin Only)
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Security Rule: Admin cannot deactivate self
    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Security Restriction: You cannot deactivate your own active admin account!',
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully!`,
      data: {
        _id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error toggling user account status',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user account permanently (Admin Only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Security Rule: Admin cannot delete their own account
    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Security Restriction: You cannot delete your own admin account!',
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    await User.findByIdAndDelete(targetUserId);

    return res.status(200).json({
      success: true,
      message: `Account for ${user.name} deleted successfully!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting user account',
      error: error.message,
    });
  }
};
