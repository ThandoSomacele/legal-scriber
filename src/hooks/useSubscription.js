// src/hooks/useSubscription.js
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/subscription/status');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setError('Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    subscription,
    loading,
    error,
    checkSubscription, // Allow manual refresh
  };
};
