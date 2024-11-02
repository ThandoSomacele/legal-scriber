// src/components/SubscriptionSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  // Automatically redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/transcribe');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow'>
        <div className='text-center'>
          <CheckCircle className='mx-auto h-16 w-16 text-green-500' />
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Subscription Successful!</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Thank you for subscribing to Legal Scriber. You can now access all premium features.
          </p>
          <div className='mt-4'>
            <button
              onClick={() => navigate('/transcribe')}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
              Start Using Legal Scriber
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
