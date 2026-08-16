import express from 'express';
import {
  getAdminDashboardStats,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  toggleUserStatus,
  deleteUserByAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * Admin Routes (/api/admin) - Protected by protect & adminOnly
 */
router.get('/dashboard', protect, adminOnly, getAdminDashboardStats);

// User Management Routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.put('/users/:id', protect, adminOnly, upload.single('avatar'), updateUserByAdmin);
router.patch('/users/:id/status', protect, adminOnly, toggleUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUserByAdmin);

export default router;
