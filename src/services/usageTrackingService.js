// src/services/usageTrackingService.js

import Subscription from '../models/Subscription.js';

export const UsageTrackingService = {
  // Track transcription usage
  async trackTranscription(userId, durationInSeconds) {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        status: 'active'
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Check if we need to reset usage for new billing period
      if (new Date() > subscription.usage.currentPeriodEnd) {
        subscription.usage.transcriptionSeconds = 0;
        subscription.usage.transcriptionCount = 0;
        subscription.usage.summaryCount = 0;
        subscription.usage.currentPeriodStart = new Date();
        subscription.usage.currentPeriodEnd = new Date();
        subscription.usage.currentPeriodEnd.setMonth(subscription.usage.currentPeriodEnd.getMonth() + 1);
      }

      // Check usage limit before recording
      if (subscription.checkUsageLimit()) {
        throw new Error('Usage limit reached for current billing period');
      }

      // Record the usage
      await subscription.recordUsage('transcription', durationInSeconds);

      return {
        success: true,
        remainingSeconds: (subscription.planId === 'basic' ? 36000 : 108000) - subscription.usage.transcriptionSeconds
      };
    } catch (error) {
      console.error('Error tracking transcription usage:', error);
      throw error;
    }
  },

  // Track summary generation usage
  async trackSummary(userId) {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        status: 'active'
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      await subscription.recordUsage('summary');

      return {
        success: true,
        summaryCount: subscription.usage.summaryCount
      };
    } catch (error) {
      console.error('Error tracking summary usage:', error);
      throw error;
    }
  },

  // Get current usage statistics
  async getUsageStats(userId) {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        status: 'active'
      });

      if (!subscription) {
        return null;
      }

      const planLimits = {
        basic: {
          transcriptionHours: 10,
          retention: 30
        },
        professional: {
          transcriptionHours: 30,
          retention: 90
        }
      };

      const limit = planLimits[subscription.planId].transcriptionHours;
      const currentUsageHours = subscription.usage.transcriptionSeconds / 3600;

      return {
        plan: subscription.planId,
        periodStart: subscription.usage.currentPeriodStart,
        periodEnd: subscription.usage.currentPeriodEnd,
        transcriptionHours: {
          used: currentUsageHours.toFixed(2),
          total: limit,
          percentage: (currentUsageHours / limit * 100).toFixed(1)
        },
        transcriptionCount: subscription.usage.transcriptionCount,
        summaryCount: subscription.usage.summaryCount
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }
};
