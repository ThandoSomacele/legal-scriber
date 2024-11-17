// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  emailConfirmationToken: String,
  emailConfirmationExpires: Date,
  subscriptionPlan: {
    type: String,
    enum: [null, 'basic', 'professional'],
    default: null,
  },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'active', 'cancelled'],
    default: 'inactive',
  },
  subscriptionHistory: [
    {
      planId: String,
      startDate: Date,
      endDate: Date,
      status: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to generate email confirmation token
userSchema.methods.generateEmailConfirmationToken = function () {
  const confirmationToken = crypto.randomBytes(32).toString('hex');

  this.emailConfirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');

  // Token expires in 24 hours
  this.emailConfirmationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return confirmationToken;
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add password reset token generation method
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiry (2 hours)
  this.passwordResetExpires = Date.now() + 2 * 60 * 60 * 1000;

  return resetToken;
};

// Add method to check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function () {
  return this.passwordResetExpires > Date.now();
};

export default mongoose.model('User', userSchema);
