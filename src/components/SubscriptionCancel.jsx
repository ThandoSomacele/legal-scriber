// src/components/SubscriptionCancel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow'>
        <div className='text-center'>
          <XCircle className='mx-auto h-16 w-16 text-red-500' />
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Subscription Cancelled</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Your subscription was not completed. If you experienced any issues, please contact our support team.
          </p>
          <div className='mt-4 space-y-2'>
            <button
              onClick={() => navigate('/subscribe')}
              className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
              Try Again
            </button>
            <button
              onClick={() => navigate('/contact')}
              className='w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50'>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
