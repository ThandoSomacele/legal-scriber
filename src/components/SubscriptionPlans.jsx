import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { initiateSubscription } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import envConfig from '../../envConfig';
import SandboxTestInfo from './SandboxTestInfo';

export default function SubscriptionPlans() {
  const [loadingStates, setLoadingStates] = useState({
    basic: false,
    professional: false,
    enterprise: false,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pricing tiers configuration
  const tiers = [
    {
      name: 'Basic',
      id: 'basic',
      price: 'R499',
      frequency: '/month',
      description: 'Perfect for small legal practices or individual lawyers.',
      features: [
        'Up to 10 hours of audio transcription',
        'Basic legal document summarisation',
        'Email support',
        '30-day data retention',
      ],
      mostPopular: false,
    },
    {
      name: 'Professional',
      id: 'professional',
      price: 'R999',
      frequency: '/month',
      description: 'Ideal for medium-sized law firms with higher volume needs.',
      features: [
        'Up to 30 hours of audio transcription',
        'Advanced legal document summarisation',
        'Priority email and chat support',
        '90-day data retention',
        'Custom vocabulary support',
      ],
      mostPopular: true,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: 'Custom',
      frequency: '',
      description: 'Tailored solutions for large law firms and legal departments.',
      features: [
        'Unlimited audio transcription',
        'Advanced legal document summarisation with custom models',
        '24/7 phone and email support',
        'Unlimited data retention',
        'Custom API integration',
        'Dedicated account manager',
      ],
      mostPopular: false,
    },
  ];

  // Handle subscription initiation
  const handleSubscribe = async tier => {
    try {
      // Check if user is logged in
      if (!user) {
        // Store the selected plan in session storage
        sessionStorage.setItem('selectedPlan', tier.id);
        // Redirect to login page
        navigate('/login', { state: { from: '/subscribe' } });
        return;
      }

      // Don't process enterprise subscriptions through PayFast
      if (tier.id === 'enterprise') {
        // TODO
        navigate('/contact');
        return;
      }

      setLoadingStates(prevState => ({ ...prevState, [tier.id]: true }));
      setError(null);

      const returnUrl = `${envConfig.frontendUrl}/subscription/success`;
      const cancelUrl = `${envConfig.frontendUrl}/subscription/cancel`;

      const { paymentUrl, paymentData } = await initiateSubscription(tier.id, returnUrl, cancelUrl);

      // Create and submit PayFast form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to initiate subscription. Please try again.');
    } finally {
      setLoadingStates(prevState => ({ ...prevState, [tier.id]: false }));
    }
  };

  return (
    <div className='bg-gray-100 py-12 sm:py-16 lg:py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl'>Choose Your Plan</h2>
          <p className='mt-4 text-xl text-gray-600'>Select the perfect plan for your legal transcription needs</p>
        </div>

        {/* Sandbox test info component */}
        <SandboxTestInfo />

        <div className='mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3'>
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-lg shadow-md divide-y divide-gray-200 ${
                tier.mostPopular ? 'border-2 border-indigo-500' : ''
              }`}>
              {tier.mostPopular && (
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <span className='inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold tracking-wider uppercase text-white'>
                    Most popular
                  </span>
                </div>
              )}
              <div className='p-6'>
                <h2 className='text-2xl font-semibold text-gray-900'>{tier.name}</h2>
                <p className='mt-4 text-sm text-gray-500'>{tier.description}</p>
                <p className='mt-8'>
                  <span className='text-4xl font-extrabold text-gray-900'>{tier.price}</span>
                  <span className='text-base font-medium text-gray-500'>{tier.frequency}</span>
                </p>
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingStates[tier.id]}
                  className={`mt-8 w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    tier.mostPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  } disabled:opacity-50`}>
                  {loadingStates[tier.id] ? (
                    <>
                      <Loader className='animate-spin -ml-1 mr-3 h-5 w-5 inline' />
                      Processing...
                    </>
                  ) : tier.id === 'enterprise' ? (
                    'Contact Sales'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
              <div className='pt-6 pb-8 px-6'>
                <h3 className='text-xs font-medium text-gray-900 tracking-wide uppercase'>What's included</h3>
                <ul role='list' className='mt-6 space-y-4'>
                  {tier.features.map(feature => (
                    <li key={feature} className='flex space-x-3'>
                      <CheckCircle className='flex-shrink-0 h-5 w-5 text-green-500' aria-hidden='true' />
                      <span className='text-sm text-gray-500'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className='mt-8 max-w-md mx-auto'>
            <div className='rounded-md bg-red-50 p-4'>
              <div className='flex'>
                <AlertCircle className='h-5 w-5 text-red-400' aria-hidden='true' />
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>{error}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
