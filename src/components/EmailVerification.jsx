import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, Loader, CheckCircle } from 'lucide-react';
import apiClient from '../apiClient';
import { useAuth } from '../contexts/authContext';

const EmailVerification = () => {
  // State management
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [error, setError] = useState('');

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();

  // Get email from location state
  const email = location.state?.email;

  // Verify we have necessary data
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    setError('');
    setResendStatus('');

    try {
      await resendVerificationEmail(email);
      setResendStatus('success');

      // For development environment only
      if (process.env.NODE_ENV === 'development') {
        console.log('Development: Check server logs for verification link');
      }
    } catch (error) {
      setResendStatus('error');
      setError(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md'>
        <div className='text-center'>
          <Mail className='mx-auto h-12 w-12 text-indigo-600' />
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>Verify Your Email</h2>
          <p className='mt-2 text-sm text-gray-600'>
            We've sent a verification link to <span className='font-medium'>{email}</span>
          </p>

          <div className='mt-8 space-y-4'>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className='w-full flex justify-center items-center px-4 py-2 border border-transparent 
                       text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'>
              {isResending ? (
                <>
                  <Loader className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </button>

            {resendStatus === 'success' && (
              <div className='flex items-center justify-center text-sm text-green-600'>
                <CheckCircle className='h-5 w-5 mr-2' />
                <span>Verification email sent successfully!</span>
              </div>
            )}

            {error && <div className='text-sm text-red-600'>{error}</div>}

            <Link to='/login' className='block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500'>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
