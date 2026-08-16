import User from '../models/User.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';

/**
 * @desc    Get user profile details
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
};

/**
 * @desc    Update user profile (Name, Phone, Avatar Upload)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If an image file was uploaded via Multer multipart/form-data
    if (req.file) {
      const cloudinaryResult = await uploadImageClodinary(req.file);
      if (cloudinaryResult && cloudinaryResult.secure_url) {
        user.avatar = cloudinaryResult.secure_url;
      }
    } else if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    // Update text fields if provided
    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload User Profile Avatar to Cloudinary
 * @route   PUT /api/users/avatar
 * @access  Private
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload (JPG, PNG, WEBP)',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Upload memory buffer image to Cloudinary
    const cloudinaryResult = await uploadImageClodinary(req.file);

    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
      });
    }

    // Update user avatar in MongoDB
    user.avatar = cloudinaryResult.secure_url;
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully!',
      avatar: updatedUser.avatar,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message,
    });
  }
};
