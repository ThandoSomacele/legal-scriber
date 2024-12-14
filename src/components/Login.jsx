import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);

      // Check if there was a selected plan
      const selectedPlan = sessionStorage.getItem('selectedPlan');
      if (selectedPlan) {
        sessionStorage.removeItem('selectedPlan'); // Clear the stored plan
        navigate('/subscribe'); // Redirect back to subscription page
      } else {
        // Regular login redirect
        const from = location.state?.from?.pathname || '/transcribe';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to log in');
    }
  };

  return (
    <div className='max-w-md mx-auto my-10 lg:my-32'>
      <h2 className='text-2xl font-bold text-indigo-700 mb-6'>Login</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
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
            />
          </div>
        </div>

        {/* Password Field */}
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
            />
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className='flex items-center justify-end'>
          <Link to='/forgot-password' className='text-sm font-medium text-indigo-600 hover:text-indigo-500'>
            Forgot your password?
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
            <span className='block sm:inline'>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type='submit'
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          Login
        </button>
      </form>

      {/* Sign Up Link */}
      <p className='mt-4 text-center text-sm text-gray-600'>
        Don&apos;t have an account?{' '}
        <Link to='/signup' className='font-medium text-indigo-600 hover:text-indigo-500'>
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
