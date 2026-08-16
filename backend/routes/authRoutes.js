import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Authentication Routes (/api/auth)
 */
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
