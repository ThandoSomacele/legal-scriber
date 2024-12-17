import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../apiClient';

const EmailConfirmation = () => {
  const [status, setStatus] = useState('confirming');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await apiClient.get(`/api/auth/confirm-email/${token}`);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);

          // Only set redirect for successful confirmation
          timeoutRef.current = setTimeout(() => {
            navigate('/login', {
              state: {
                message: response.data.message,
                verified: true,
              },
            });
          }, 3000);
        } else {
          // Explicitly handle non-success responses
          setStatus('error');
          setMessage(response.data.message || 'Failed to confirm email');
        }
      } catch (error) {
        setStatus('error');
        // Handle different error cases
        if (error.response?.status === 400) {
          setMessage(error.response.data.message || 'Invalid or expired confirmation link');
        } else {
          setMessage('An error occurred while confirming your email');
        }
      }
    };

    if (token) {
      confirmEmail();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, navigate]);

  // No automatic redirection for errors
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
        <div className='flex flex-col items-center'>
          {status === 'confirming' ? (
            <div className='flex flex-col items-center'>
              <Loader className='h-12 w-12 text-indigo-600 animate-spin mb-4' />
              <p className='text-gray-600'>Confirming your email address...</p>
            </div>
          ) : status === 'success' ? (
            <>
              <CheckCircle className='h-12 w-12 text-green-500 mb-4' />
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Email Confirmed!</h2>
              <p className='text-gray-600 mb-4'>{message}</p>
              <p className='text-sm text-gray-500'>Redirecting to login...</p>
            </>
          ) : (
            <>
              <XCircle className='h-12 w-12 text-red-500 mb-4' />
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Confirmation Failed</h2>
              <p className='text-red-600 mb-6'>{message}</p>
              <div className='space-y-4 w-full'>
                <Link
                  to='/email-verification'
                  className='block w-full text-center px-4 py-2 border border-transparent text-sm font-medium 
                           rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>
                  Request New Confirmation Email
                </Link>
                <Link
                  to='/login'
                  className='block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium 
                           rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
