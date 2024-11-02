// src/services/adminAnalyticsService.js

import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

export const AdminAnalyticsService = {
  async getSubscriptionMetrics(dateRange = '30d') {
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - ranges[dateRange]);

    const [
      activeSubscriptions,
      subscriptionsByPlan,
      totalRevenue,
      recentTransactions,
      churnRate
    ] = await Promise.all([
      // Active subscriptions count
      Subscription.countDocuments({ 
        status: 'active',
        createdAt: { $gte: startDate }
      }),

      // Subscriptions by plan
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { 
          _id: '$planId',
          count: { $sum: 1 },
          revenue: { $sum: '$paymentData.amount_gross' }
        }}
      ]),

      // Total revenue
      Subscription.aggregate([
        { 
          $match: { 
            'billingHistory.date': { $gte: startDate },
            'billingHistory.status': 'COMPLETE'
          }
        },
        { 
          $unwind: '$billingHistory'
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$billingHistory.amount' }
          }
        }
      ]),

      // Recent transactions
      Subscription.aggregate([
        { $unwind: '$billingHistory' },
        { $sort: { 'billingHistory.date': -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        }
      ]),

      // Churn rate calculation
      this.calculateChurnRate(startDate)
    ]);

    return {
      activeSubscriptions,
      subscriptionsByPlan,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentTransactions,
      churnRate
    };
  },

  async calculateChurnRate(startDate) {
    const endDate = new Date();
    
    const startingSubscriptions = await Subscription.countDocuments({
      createdAt: { $lt: startDate },
      status: 'active'
    });

    const cancelledSubscriptions = await Subscription.countDocuments({
      status: 'cancelled',
      cancelledDate: {
        $gte: startDate,
        $lte: endDate
      }
    });

    return startingSubscriptions > 0 
      ? (cancelledSubscriptions / startingSubscriptions) * 100 
      : 0;
  },

  async getUserMetrics() {
    const [
      totalUsers,
      activeUsers,
      usersByPlan,
      recentSignups
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionStatus: 'active' }),
      User.aggregate([
        {
          $group: {
            _id: '$subscriptionPlan',
            count: { $sum: 1 }
          }
        }
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email createdAt subscriptionPlan')
    ]);

    return {
      totalUsers,
      activeUsers,
      usersByPlan,
      recentSignups
    };
  },

  async getUsageMetrics() {
    const [
      totalTranscriptionHours,
      averageTranscriptionLength,
      peakUsageHours
    ] = await Promise.all([
      Subscription.aggregate([
        {
          $group: {
            _id: null,
            total: { 
              $sum: '$usage.transcriptionSeconds' 
            }
          }
        }
      ]),
      Subscription.aggregate([
        {
          $group: {
            _id: null,
            avg: { 
              $avg: { 
                $divide: ['$usage.transcriptionSeconds', '$usage.transcriptionCount'] 
              }
            }
          }
        }
      ]),
      this.calculatePeakUsageHours()
    ]);

    return {
      totalTranscriptionHours: (totalTranscriptionHours[0]?.total || 0) / 3600,
      averageTranscriptionLength: (averageTranscriptionLength[0]?.avg || 0) / 60,
      peakUsageHours
    };
  },

  async calculatePeakUsageHours() {
    // This would be implemented based on your logging system
    // For now, returning mock data
    return [
      { hour: 9, usage: 25 },
      { hour: 10, usage: 45 },
      { hour: 11, usage: 65 },
      { hour: 12, usage: 35 },
      { hour: 13, usage: 30 },
      { hour: 14, usage: 40 },
      { hour: 15, usage: 55 },
      { hour: 16, usage: 50 },
      { hour: 17, usage: 20 }
    ];
  }
};
