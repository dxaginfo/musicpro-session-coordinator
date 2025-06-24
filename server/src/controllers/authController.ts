import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import logger from '../utils/logger';

// Generate JWT token
const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '1d',
    }
  );
};

// Generate refresh token
const generateRefreshToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({
        error: {
          message: 'User already exists with this email',
        },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
      },
    });

    // If user is a musician, create musician profile
    if (role === 'MUSICIAN') {
      await prisma.musicianProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during registration',
      },
    });
  }
};

// @desc    Login a user and get tokens
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate tokens
      const token = generateToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token,
        refreshToken,
      });
    } else {
      res.status(401).json({
        error: {
          message: 'Invalid email or password',
        },
      });
    }
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during login',
      },
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        bio: true,
        website: true,
        socialLinks: true,
        isVerified: true,
        createdAt: true,
        musicianProfile: req.user?.role === 'MUSICIAN',
      },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
        },
      });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get current user error', { error });
    res.status(500).json({
      error: {
        message: 'Server error while fetching user data',
      },
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          message: 'Refresh token is required',
        },
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { id: string };

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Invalid refresh token',
          },
        });
      }

      // Generate new access token
      const token = generateToken(user.id, user.email, user.role);

      res.json({ token });
    } catch (error) {
      res.status(401).json({
        error: {
          message: 'Invalid or expired refresh token',
        },
      });
    }
  } catch (error) {
    logger.error('Refresh token error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during token refresh',
      },
    });
  }
};

// @desc    Logout and invalidate tokens
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  // In a more complex implementation, we might want to blacklist tokens
  // For now, we just return a success message
  res.json({ message: 'Logged out successfully' });
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.json({
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // In a real implementation, we would:
    // 1. Generate a reset token
    // 2. Save it in the database with an expiration
    // 3. Send an email with a reset link

    // For this skeleton implementation, we just return a success message
    res.json({
      message: 'If the email exists, a reset link has been sent',
    });
  } catch (error) {
    logger.error('Forgot password error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during password reset request',
      },
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public (with reset token)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // In a real implementation, we would:
    // 1. Verify the reset token from the database
    // 2. Check if it's not expired
    // 3. Find the associated user
    // 4. Update the password

    // For this skeleton implementation, we just return a success message
    res.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    logger.error('Reset password error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during password reset',
      },
    });
  }
};

// @desc    Change password when logged in
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
        },
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: {
          message: 'Current password is incorrect',
        },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    logger.error('Change password error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during password change',
      },
    });
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public (with verification token)
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // In a real implementation, we would:
    // 1. Verify the email verification token from the database
    // 2. Check if it's not expired
    // 3. Find the associated user
    // 4. Mark the email as verified

    // For this skeleton implementation, we just return a success message
    res.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error('Email verification error', { error });
    res.status(500).json({
      error: {
        message: 'Server error during email verification',
      },
    });
  }
};