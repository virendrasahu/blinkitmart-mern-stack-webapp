import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Wishlist Routes (/api/wishlist) - Protected
 */
router.get('/', protect, getWishlist);
router.post('/:productId', protect, toggleWishlist);

export default router;
