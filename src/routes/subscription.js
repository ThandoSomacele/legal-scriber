// src/routes/subscription.js

import express from 'express';
import auth from '../middleware/auth.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { verifyNotification } from '../services/subscriptionService.js';

const router = express.Router();

/**
 * Create a new subscription
 * POST /api/subscription/create
 * Requires authentication
 */
router.post('/create', auth, async (req, res) => {
  try {
    const { planId, paymentData } = req.body;
    const userId = req.user.id;

    // Validate plan ID
    if (!['basic', 'professional'].includes(planId)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Check for existing active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        message: 'User already has an active subscription'
      });
    }

    // Create new subscription
    const subscription = new Subscription({
      user: userId,
      planId,
      paymentData,
      status: 'pending'
    });

    await subscription.save();

    res.status(201).json({
      message: 'Subscription initiated successfully',
      subscriptionId: subscription._id
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

/**
 * Handle PayFast ITN (Instant Transaction Notification)
 * POST /api/subscription/notify
 * No authentication (PayFast server-to-server communication)
 */
router.post('/notify', async (req, res) => {
  // Log the full notification for debugging
  console.log('Received PayFast notification:', req.body);

  try {
    // Build PayFast data and parameter string
    const pfData = { ...req.body };
    const pfParamString = Object.keys(pfData)
      .filter(key => key !== 'signature')
      .map(key => `${key}=${encodeURIComponent(pfData[key])}`)
      .join('&');

    // Verify PayFast notification
    const isValid = await verifyNotification(pfData, pfParamString);
    if (!isValid) {
      console.error('Invalid PayFast notification');
      return res.status(400).send('invalid');
    }

    // Find subscription by payment ID
    const subscription = await Subscription.findOne({
      'paymentData.m_payment_id': pfData.m_payment_id
    });

    if (!subscription) {
      console.error('Subscription not found for payment:', pfData.m_payment_id);
      return res.status(404).send('not found');
    }

    // Update payment data
    subscription.paymentData = {
      ...subscription.paymentData,
      pf_payment_id: pfData.pf_payment_id,
      payment_status: pfData.payment_status,
      item_name: pfData.item_name,
      amount_gross: parseFloat(pfData.amount_gross),
      amount_fee: parseFloat(pfData.amount_fee),
      amount_net: parseFloat(pfData.amount_net)
    };

    // Update subscription status based on payment status
    switch (pfData.payment_status) {
      case 'COMPLETE':
        subscription.status = 'active';
        subscription.startDate = new Date();
        // Set end date to one month from now
        subscription.endDate = new Date();
        subscription.endDate.setMonth(subscription.endDate.getMonth() + 1);
        break;
      case 'CANCELLED':
        subscription.status = 'cancelled';
        subscription.cancelledDate = new Date();
        break;
      case 'FAILED':
        subscription.status = 'failed';
        break;
      default:
        console.warn('Unknown payment status:', pfData.payment_status);
    }

    await subscription.save();

    // For active subscriptions, update user's subscription status
    if (subscription.status === 'active') {
      await User.findByIdAndUpdate(subscription.user, {
        subscriptionPlan: subscription.planId,
        subscriptionStatus: 'active'
      });
    }

    res.send('ok');

  } catch (error) {
    console.error('Error processing PayFast notification:', error);
    res.status(500).send('error');
  }
});

/**
 * Get subscription status
 * GET /api/subscription/status
 * Requires authentication
 */
router.get('/status', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        active: false,
        message: 'No active subscription found'
      });
    }

    // Check if subscription has expired
    if (subscription.endDate && new Date() > subscription.endDate) {
      subscription.status = 'expired';
      await subscription.save();

      // Update user's subscription status
      await User.findByIdAndUpdate(req.user.id, {
        subscriptionPlan: null,
        subscriptionStatus: 'inactive'
      });

      return res.json({
        active: false,
        message: 'Subscription has expired'
      });
    }

    res.json({
      active: true,
      subscription: {
        planId: subscription.planId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status
      }
    });

  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      message: 'Failed to check subscription status',
      error: error.message
    });
  }
});

/**
 * Cancel subscription
 * POST /api/subscription/cancel
 * Requires authentication
 */
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({
        message: 'No active subscription found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancelledDate = new Date();
    await subscription.save();

    // Update user's subscription status
    await User.findByIdAndUpdate(req.user.id, {
      subscriptionPlan: null,
      subscriptionStatus: 'inactive'
    });

    res.json({
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

export default router;
