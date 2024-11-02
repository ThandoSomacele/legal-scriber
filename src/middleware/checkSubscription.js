// src/middleware/checkSubscription.js
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Allow limited access for users without subscription
    if (!user.subscriptionPlan) {
      req.subscription = {
        plan: 'free',
        limits: {
          transcriptionHours: 1,
          retention: 7, // days
        },
      };
      return next();
    }

    const subscription = await Subscription.findOne({
      user: user._id,
      status: 'active',
    });

    if (!subscription) {
      // Reset user subscription status if no active subscription found
      await User.findByIdAndUpdate(user._id, {
        subscriptionPlan: null,
        subscriptionStatus: 'inactive',
      });

      return res.status(403).json({
        message: 'No active subscription found',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    // Set plan limits
    const planLimits = {
      basic: {
        transcriptionHours: 10,
        retention: 30, // days
      },
      professional: {
        transcriptionHours: 30,
        retention: 90, // days
      },
    };

    req.subscription = {
      plan: subscription.planId,
      limits: planLimits[subscription.planId],
    };

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

export default checkSubscription;
