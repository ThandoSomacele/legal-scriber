// src/components/EmailConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import apiClient from '../apiClient';

const EmailConfirmation = () => {
  const [status, setStatus] = useState('confirming'); // confirming, success, error
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await apiClient.get(`/api/auth/confirm-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'An error occurred during email confirmation');
      }
    };

    confirmEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'confirming':
        return (
          <div className="flex flex-col items-center">
            <Loader className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Confirming your email address...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Sign In
            </Link>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h2>
            <p className="text-red-600 mb-6">{message}</p>
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Back to Sign Up
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailConfirmation;
