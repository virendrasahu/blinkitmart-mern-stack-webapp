import express from 'express';
import {
  getCoupons,
  applyCoupon,
  createCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

/**
 * Coupon Routes (/api/coupons)
 */
router.get('/', getCoupons);
router.post('/apply', applyCoupon);
router.post('/', protect, adminOnly, createCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
