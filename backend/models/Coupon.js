import mongoose from 'mongoose';

/**
 * Coupon Database Schema (Coupon.js)
 * 
 * What it does:
 * - Represents promotional discount coupons (e.g. WELCOME50, BLINKIT20).
 * - Stores code, discount type (fixed amount / percentage), discount value, minimum order threshold, maximum discount cap, expiry date, and active status.
 */
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please enter coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'fixed', // 'fixed' = ₹ OFF, 'percentage' = % OFF
    },
    discountValue: {
      type: Number,
      required: [true, 'Please specify discount value'],
      min: [1, 'Discount value must be greater than 0'],
    },
    minimumOrderValue: {
      type: Number,
      default: 0, // Minimum order amount required to apply coupon
    },
    maximumDiscount: {
      type: Number,
      default: null, // Maximum capped discount amount for percentage coupons
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify coupon expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
