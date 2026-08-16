import Coupon from '../models/Coupon.js';

/**
 * @desc    Get all active coupons
 * @route   GET /api/coupons
 * @access  Public
 */
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
    });
  }
};

/**
 * @desc    Apply and validate coupon code against cart subtotal
 * @route   POST /api/coupons/apply
 * @access  Public / Private
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code and cart subtotal',
      });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // 1. Find coupon by code
    const coupon = await Coupon.findOne({ code: uppercaseCode });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // 2. BUSINESS RULE: Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is currently inactive',
      });
    }

    // 3. BUSINESS RULE: Check if coupon has expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon code has expired',
      });
    }

    // 4. BUSINESS RULE: Check minimum order value requirement
    if (Number(subtotal) < coupon.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderValue} required for this coupon`,
      });
    }

    // 5. Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      const calculated = (Number(subtotal) * coupon.discountValue) / 100;
      discountAmount = coupon.maximumDiscount 
        ? Math.min(calculated, coupon.maximumDiscount) 
        : calculated;
    }

    // Ensure discount does not exceed subtotal
    discountAmount = Math.min(Number(subtotal), discountAmount);

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully! Savings ₹${discountAmount}`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error applying coupon',
    });
  }
};

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private (Admin Only)
 */
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minimumOrderValue, maximumDiscount, expiryDate } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required coupon fields',
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'fixed',
      discountValue: Number(discountValue),
      minimumOrderValue: Number(minimumOrderValue || 0),
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      expiryDate: new Date(expiryDate),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully!',
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating coupon',
    });
  }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin Only)
 */
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    await coupon.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
    });
  }
};
