// src/services/subscriptionManagementService.js

import apiClient from '../apiClient';
import { SUBSCRIPTION_PLANS } from './subscriptionService';

export const SubscriptionManagementService = {
  // Get available upgrade options for current plan
  async getUpgradeOptions(currentPlanId) {
    const planOrder = ['basic', 'professional'];
    const currentIndex = planOrder.indexOf(currentPlanId);
    
    return planOrder
      .slice(currentIndex + 1)
      .map(planId => SUBSCRIPTION_PLANS[planId.toUpperCase()]);
  },

  // Get available downgrade options for current plan
  async getDowngradeOptions(currentPlanId) {
    const planOrder = ['basic', 'professional'];
    const currentIndex = planOrder.indexOf(currentPlanId);
    
    return planOrder
      .slice(0, currentIndex)
      .map(planId => SUBSCRIPTION_PLANS[planId.toUpperCase()]);
  },

  // Process plan change
  async changePlan(newPlanId) {
    try {
      const response = await apiClient.post('/api/subscription/change-plan', {
        newPlanId
      });
      return response.data;
    } catch (error) {
      console.error('Error changing plan:', error);
      throw error;
    }
  },

  // Calculate prorated amount for plan change
  async calculateProration(currentPlanId, newPlanId) {
    try {
      const response = await apiClient.post('/api/subscription/calculate-proration', {
        currentPlanId,
        newPlanId
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating proration:', error);
      throw error;
    }
  },

  // Send usage notification email
  async sendUsageNotification(userId, type) {
    try {
      await apiClient.post('/api/subscription/notify-usage', {
        userId,
        type // 'warning' | 'limit-reached'
      });
    } catch (error) {
      console.error('Error sending usage notification:', error);
      throw error;
    }
  }
};
