import express from 'express';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * User Profile Routes (/api/users)
 */
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
