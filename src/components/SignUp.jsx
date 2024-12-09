import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.password);
      setSuccess(true);
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/transcribe');
      }, 2000);
    } catch (error) {
      // Check for specific error message from the server
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create an account. Please try again.');
      }
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
              <User className='h-5 w-5 text-gray-400' aria-hidden='true' />
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
              <Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
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
              <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
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
              <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
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
            <span className='block sm:inline'>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center'
            role='alert'>
            <CheckCircle className='h-5 w-5 mr-2' />
            <span className='block sm:inline'>Account created successfully! Redirecting...</span>
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
