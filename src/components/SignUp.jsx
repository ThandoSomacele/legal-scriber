import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

const SignUp = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Hooks
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation checks
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      // Attempt signup
      await signup(formData.name, formData.email, formData.password);

      // Redirect to verification page on success
      navigate('/email-verification', {
        state: {
          email: formData.email,
          message: 'Please check your email to confirm your account',
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-md mx-auto my-10 lg:my-32'>
      <h2 className='text-2xl font-bold text-indigo-700 mb-6'>Sign Up</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Name Field */}
        <div>
          <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
            Name
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <User className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              name='name'
              id='name'
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md'
              placeholder='John Doe'
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
            Email
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Mail className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='email'
              name='email'
              id='email'
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md'
              placeholder='you@example.com'
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Password Fields */}
        <div>
          <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
            Password
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Lock className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='password'
              name='password'
              id='password'
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md'
              placeholder='********'
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
            Confirm Password
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Lock className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='password'
              name='confirmPassword'
              id='confirmPassword'
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md'
              placeholder='********'
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 mr-2' />
              <span className='block sm:inline'>{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'>
          {isSubmitting ? (
            <div className='flex items-center'>
              <Loader className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' />
              Creating Account...
            </div>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className='mt-4 text-center text-sm text-gray-600'>
        Already have an account?{' '}
        <Link to='/login' className='font-medium text-indigo-600 hover:text-indigo-500'>
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
