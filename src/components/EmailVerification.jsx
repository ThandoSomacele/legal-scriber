import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

const EmailVerification = () => {
  // State management
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();

  // Get email from location state
  const { email, message } = location.state || {};

  // Verify we have necessary data
  useEffect(() => {
    if (!email && !location.state?.email) {
      navigate('/signup');
    }
    setLoading(false);
  }, [email, location.state, navigate]);

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
      const response = await resendVerificationEmail(email);
      setResendStatus('success');

      // Log confirmation URL in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development: Check console for confirmation link');
      }
    } catch (error) {
      setResendStatus('error');
      setError(error.response?.data?.message || 'Failed to resend verification email');
      console.error('Verification email error:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader className='h-8 w-8 text-indigo-600 animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow'>
        <div className='text-center'>
          <Mail className='mx-auto h-12 w-12 text-indigo-600' />
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>Check Your Email</h2>

          {/* Email verification instructions */}
          {email ? (
            <p className='mt-2 text-sm text-gray-600'>
              We've sent a verification link to <span className='font-medium'>{email}</span>. Please check your email
              and click the link to activate your account.
            </p>
          ) : (
            <p className='mt-2 text-sm text-gray-600'>Please check your email for the verification link.</p>
          )}

          <div className='mt-6 space-y-4'>
            {/* Resend Email Button */}
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
                'Resend verification email'
              )}
            </button>

            {/* Status Messages */}
            {resendStatus === 'success' && (
              <div className='flex items-center justify-center text-sm text-green-600'>
                <CheckCircle className='h-5 w-5 mr-2' />
                <span>Verification email resent successfully!</span>
              </div>
            )}

            {error && (
              <div className='flex items-center justify-center text-sm text-red-600'>
                <AlertCircle className='h-5 w-5 mr-2' />
                <span>{error}</span>
              </div>
            )}

            {/* Back to Login Link */}
            <Link
              to='/login'
              className='block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 
                       transition-colors duration-200'>
              Return to login
            </Link>

            {/* Development Mode Notice */}
            {process.env.NODE_ENV === 'development' && (
              <p className='text-xs text-gray-500 mt-4'>
                Development Mode: Check the console for the confirmation link.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
