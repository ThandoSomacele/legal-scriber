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
  usage: {
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      },
    },
    transcriptionSeconds: {
      type: Number,
      default: 0,
    },
    transcriptionCount: {
      type: Number,
      default: 0,
    },
    summaryCount: {
      type: Number,
      default: 0,
    },
  },

  billingHistory: [
    {
      amount: Number,
      date: Date,
      status: String,
      paymentId: String,
    },
  ],
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

// Add method to check if usage limit is reached
subscriptionSchema.methods.checkUsageLimit = function () {
  const planLimits = {
    basic: {
      transcriptionHours: 10,
      retention: 30,
    },
    professional: {
      transcriptionHours: 30,
      retention: 90,
    },
  };

  const currentUsageHours = this.usage.transcriptionSeconds / 3600;
  const limit = planLimits[this.planId]?.transcriptionHours || 0;

  return currentUsageHours >= limit;
};

// Add method to record usage
subscriptionSchema.methods.recordUsage = async function (type, amount = 1) {
  switch (type) {
    case 'transcription':
      this.usage.transcriptionCount += 1;
      this.usage.transcriptionSeconds += amount;
      break;
    case 'summary':
      this.usage.summaryCount += 1;
      break;
  }

  return this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
