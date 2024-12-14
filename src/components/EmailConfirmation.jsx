import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../apiClient';

const EmailConfirmation = () => {
  const [status, setStatus] = useState('confirming'); // confirming, success, error
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await apiClient.get(`/api/auth/confirm-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);

        // After successful confirmation, redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Email confirmed successfully. You can now log in.',
            },
          });
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to confirm email');
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
        {/* Loading State */}
        {status === 'confirming' && (
          <div className='flex flex-col items-center'>
            <Loader className='h-12 w-12 text-indigo-600 animate-spin mb-4' />
            <p className='text-gray-600'>Confirming your email address...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className='flex flex-col items-center'>
            <CheckCircle className='h-12 w-12 text-green-500 mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Email Confirmed!</h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            <p className='text-sm text-gray-500'>Redirecting to login...</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className='flex flex-col items-center'>
            <XCircle className='h-12 w-12 text-red-500 mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Confirmation Failed</h2>
            <p className='text-red-600 mb-6'>{message}</p>
            <Link
              to='/signup'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;
