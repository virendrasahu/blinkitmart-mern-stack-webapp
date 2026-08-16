import User from '../models/User.js';

/**
 * @desc    Get user's saved wishlist products
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name brand price mrp image unit stock rating numReviews discount isActive',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message,
    });
  }
};

/**
 * @desc    Add or remove product from wishlist (Toggle)
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Convert ObjectIds to strings to accurately find index in array
    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString()
    );

    let action = '';

    if (existingIndex > -1) {
      // Remove product from wishlist
      user.wishlist.splice(existingIndex, 1);
      action = 'removed';
    } else {
      // Add product to wishlist (Prevents duplicates)
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();

    // Populate updated wishlist items
    const updatedUser = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name brand price mrp image unit stock rating numReviews discount isActive',
    });

    return res.status(200).json({
      success: true,
      message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist!`,
      action,
      data: updatedUser.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating wishlist',
      error: error.message,
    });
  }
};
