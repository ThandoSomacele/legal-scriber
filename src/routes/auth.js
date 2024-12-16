// src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Add this import for token hashing
import auth from '../middleware/auth.js'; // Import the auth middleware
import User from '../models/User.js';
import azureEmailService from '../services/azureEmailService.js';
import logger from '../utils/logger.js';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many attempts. Please try again later.',
  keyGenerator: req => {
    // Use the modern approach to get client IP
    return (
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress || // Modern way to access remote address
      'unknown'
    );
  },
  skip: req => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      logger.warn('Missing required fields in signup attempt');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      logger.warn(`Signup attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Create new user
    user = new User({ name, email, password });

    // Generate confirmation token
    const confirmationToken = user.generateEmailConfirmationToken();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user first
    await user.save();
    logger.info(`New user created: ${user._id}`);

    // Send confirmation email using Azure Communication Services
    try {
      const emailResult = await azureEmailService.sendSignupConfirmation(user, confirmationToken);
      logger.info(`Confirmation email sent successfully for: ${email}`, {
        operationId: emailResult.id,
        status: emailResult.status,
      });
    } catch (emailError) {
      logger.error('Error sending confirmation email:', {
        error: emailError.message,
        userId: user._id,
        email: email,
      });
      // Don't expose email sending errors to the client
      // Continue with signup even if email fails
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      message:
        process.env.NODE_ENV === 'development'
          ? 'Account created successfully (check console for email details)'
          : 'Please check your email to confirm your account',
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Email confirmation endpoint - updated with better error handling and logging
router.get('/confirm-email/:token', async (req, res) => {
  try {
    // Hash the token from the URL for comparison
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    logger.info('Processing email confirmation request', { hashedToken });

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailConfirmationToken: hashedToken,
      emailConfirmationExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn('Invalid or expired confirmation token used', {
        hashedToken,
        expired: true,
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired confirmation link. Please request a new one.',
      });
    }

    // Update user document
    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;

    // Save the updated user document
    await user.save();

    logger.info('Email confirmed successfully', {
      userId: user._id,
      email: user.email,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Email confirmed successfully. You can now log in.',
      redirectUrl: '/login', // Add this to support frontend redirection
    });
  } catch (error) {
    logger.error('Email confirmation error:', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'An error occurred while confirming your email. Please try again.',
    });
  }
});

// Resend verification emails
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a new verification email will be sent.',
      });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified.',
      });
    }

    // Generate new confirmation token
    const confirmationToken = user.generateEmailConfirmationToken();
    await user.save();

    // Send new confirmation email
    try {
      const emailResult = await azureEmailService.sendSignupConfirmation(user, confirmationToken);
      logger.info(`Verification email resent successfully for: ${email}`, {
        operationId: emailResult.id,
        status: emailResult.status,
      });
    } catch (emailError) {
      logger.error('Error resending verification email:', {
        error: emailError.message,
        userId: user._id,
        email: email,
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists, a new verification email will be sent.',
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
});

// Login route - updated to check for email confirmation
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      return res.status(401).json({
        success: false,
        message: 'Please confirm your email address before logging in.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Update the response in your login route
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailConfirmed: user.isEmailConfirmed, // Add this explicitly
      },
    });
  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
});

// Password reset request endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Always return the same response whether user exists or not (security best practice)
    if (!user) {
      logger.info('Password reset requested for non-existent email', { email });
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, you will receive password reset instructions.',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send password reset email using Azure Communication Services
      const emailResult = await azureEmailService.sendPasswordResetEmail(user, resetToken);

      logger.info('Password reset email sent successfully', {
        userId: user._id,
        email: user.email,
        messageId: emailResult.id,
      });

      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, you will receive password reset instructions.',
      });
    } catch (emailError) {
      // Reset the token fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('Error sending password reset email:', {
        error: emailError.message,
        userId: user._id,
        email: user.email,
      });

      return res.status(500).json({
        success: false,
        message: 'There was an error sending the password reset email. Please try again later.',
      });
    }
  } catch (error) {
    logger.error('Password reset request error:', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
});

// Reset password endpoint
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    // Basic password validation
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Hash the token from the URL
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn('Invalid or expired password reset token used', { hashedToken });
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired. Please request a new one.',
      });
    }

    // Update password and clear reset token fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    logger.info('Password reset successful', {
      userId: user._id,
      email: user.email,
    });

    // Optionally, send confirmation email
    try {
      await azureEmailService.sendEmail(
        user.email,
        'Password Reset Successful',
        `<p>Your password has been successfully reset. If you did not perform this action, please contact support immediately.</p>`
      );
    } catch (emailError) {
      // Log but don't fail the request if confirmation email fails
      logger.warn('Failed to send password reset confirmation email', {
        error: emailError.message,
        userId: user._id,
        email: user.email,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    logger.error('Password reset error:', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password. Please try again.',
    });
  }
});

// Add a route to validate reset token (useful for frontend validation)
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: 'Password reset token is valid.',
    });
  } catch (error) {
    logger.error('Token validation error:', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      valid: false,
      message: 'An error occurred while validating the reset token.',
    });
  }
});

// Protected Routes (require authentication)

// Get User Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Update User Profile
router.put('/update-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'email'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(user, updates);
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
