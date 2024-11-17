// src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import emailService from '../services/azureEmailService.js';
import logger from '../utils/logger.js';

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

    await user.save();
    logger.info(`New user created: ${user._id}`);

    // Send confirmation email
    try {
      await emailService.sendSignupConfirmation(user, confirmationToken);
      logger.info(`Confirmation email handled for: ${email}`);
    } catch (emailError) {
      logger.warn('Error handling confirmation email:', emailError);
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

// Email confirmation endpoint
router.get('/confirm-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailConfirmationToken: hashedToken,
      emailConfirmationExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn('Invalid or expired confirmation token used');
      return res.status(400).json({ message: 'Invalid or expired confirmation link' });
    }

    // Update user
    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();

    logger.info(`Email confirmed for user: ${user._id}`);
    res.json({ message: 'Email confirmed successfully' });
  } catch (error) {
    logger.error('Email confirmation error:', error);
    res.status(500).json({ message: 'Error confirming email' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Ensure this is a string representing a timespan
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found for security
      return res.status(200).json({
        message: 'If an account exists with that email, you will receive password reset instructions.',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
      logger.info(`Password reset email handled for: ${email}`);
    } catch (emailError) {
      logger.warn('Error handling password reset email:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }

    res.status(200).json({
      message:
        process.env.NODE_ENV === 'development'
          ? 'Password reset requested (check console for email details)'
          : 'If an account exists with that email, you will receive password reset instructions.',
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    logger.info(`Password reset successful for user: ${user._id}`);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default router;
