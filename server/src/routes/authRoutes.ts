import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .isIn(['MUSICIAN', 'PRODUCER', 'BAND_MANAGER'])
      .withMessage('Invalid role'),
  ],
  validateRequest,
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login a user and get a token
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, authController.getCurrentUser);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (with refresh token)
router.post('/refresh', authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout and invalidate tokens
// @access  Private
router.post('/logout', protect, authController.logout);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  validateRequest,
  authController.forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public (with reset token)
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  authController.resetPassword
);

// @route   PUT /api/auth/change-password
// @desc    Change password when logged in
// @access  Private
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validateRequest,
  authController.changePassword
);

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public (with verification token)
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  validateRequest,
  authController.verifyEmail
);

export default router;