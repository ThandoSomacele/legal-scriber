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
    select: false, // Don't return password by default
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// IMPORTANT: Only hash password if it's being modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    // Since password field is not selected by default, ensure it's available
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    return false;
  }
};

// Update email confirmation methods
userSchema.methods.generateEmailConfirmationToken = function () {
  // Generate raw token
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Store hashed version
  this.emailConfirmationToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Set expiry
  this.emailConfirmationExpires = Date.now() + 24 * 60 * 60 * 1000;

  // Return raw token for email
  return rawToken;
};

// Used when confirming email
userSchema.methods.verifyEmailConfirmationToken = function (rawToken) {
  if (!this.emailConfirmationToken || !this.emailConfirmationExpires) {
    return false;
  }

  const hashedReceivedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Check both token match and expiry
  if (this.emailConfirmationToken === hashedReceivedToken && this.emailConfirmationExpires > Date.now()) {
    this.isEmailConfirmed = true;
    this.emailConfirmationToken = undefined;
    this.emailConfirmationExpires = undefined;
    return true;
  }
  return false;
};

export default mongoose.model('User', userSchema);
