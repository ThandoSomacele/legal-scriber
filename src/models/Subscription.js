// src/models/Subscription.js

import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: String,
    required: true,
    enum: ['basic', 'professional'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'cancelled', 'failed'],
    default: 'pending',
  },
  paymentData: {
    m_payment_id: { type: String, required: true },
    pf_payment_id: String,
    payment_status: String,
    item_name: String,
    amount_gross: Number,
    amount_fee: Number,
    amount_net: Number,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  cancelledDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
subscriptionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ 'paymentData.m_payment_id': 1 });
subscriptionSchema.index({ status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
