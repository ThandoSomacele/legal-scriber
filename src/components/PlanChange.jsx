import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { SubscriptionManagementService } from '../services/subscriptionManagementService';
import { useSubscription } from '../hooks/useSubscription';

export default function PlanChange() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [prorationAmount, setProrationAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [changeType, setChangeType] = useState(null); // 'upgrade' or 'downgrade'

  useEffect(() => {
    const loadAvailablePlans = async () => {
      if (!subscription?.subscription?.planId) return;
      
      const currentPlan = subscription.subscription.planId;
      let plans;
      
      if (changeType === 'upgrade') {
        plans = await SubscriptionManagementService.getUpgradeOptions(currentPlan);
      } else if (changeType === 'downgrade') {
        plans = await SubscriptionManagementService.getDowngradeOptions(currentPlan);
      }
      
      setAvailablePlans(plans || []);
    };

    loadAvailablePlans();
  }, [subscription, changeType]);

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    try {
      const proration = await SubscriptionManagementService.calculateProration(
        subscription.subscription.planId,
        plan.id
      );
      setProrationAmount(proration.amount);
    } catch (error) {
      setError('Failed to calculate price adjustment');
    }
  };

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      await SubscriptionManagementService.changePlan(selectedPlan.id);
      // Show success message and redirect
      navigate('/subscription/success-change');
    } catch (error) {
      setError('Failed to change plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Subscription Plan</h2>

      {/* Change Type Selection */}
      {!changeType && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          <button
            onClick={() => setChangeType('upgrade')}
            className="flex items-center justify-center p-6 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 transition-colors"
          >
            <ArrowUpCircle className="h-8 w-8 text-indigo-600 mr-3" />
            <span className="text-lg font-medium">Upgrade Plan</span>
          </button>
          <button
            onClick={() => setChangeType('downgrade')}
            className="flex items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-gray-500 transition-colors"
          >
            <ArrowDownCircle className="h-8 w-8 text-gray-600 mr-3" />
            <span className="text-lg font-medium">Downgrade Plan</span>
          </button>
        </div>
      )}

      {/* Available Plans */}
      {changeType && (
        <div className="space-y-4">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 ${
                selectedPlan?.id === plan.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">R{plan.price}/month</p>
                </div>
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`px-4 py-2 rounded-md ${
                    selectedPlan?.id === plan.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-600 border border-indigo-600'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select'}
                </button>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Proration Information */}
          {prorationAmount !== null && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Price Adjustment</h4>
              <p className="text-sm text-gray-600">
                {prorationAmount > 0
                  ? `You will be charged R${prorationAmount} for the remainder of your billing period.`
                  : `You will receive a credit of R${Math.abs(prorationAmount)} for your next billing period.`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setChangeType(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePlanChange}
              disabled={!selectedPlan || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 inline" />
                  Processing...
                </>
              ) : (
                'Confirm Change'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
