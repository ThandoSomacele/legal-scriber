import React, { useState, useEffect } from 'react';
import { Clock, FileText, BarChart2, AlertCircle, Loader } from 'lucide-react';
import apiClient from '../apiClient';

const UsageDashboard = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await apiClient.get('/api/subscription/usage');
        setUsage(response.data);
      } catch (error) {
        setError('Failed to fetch usage data'); //TODO when no usage data is availabe let shows something more logical e.g. you have not made any transriptions yet.
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <Loader className='animate-spin h-8 w-8 text-indigo-600' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 p-4 rounded-md'>
        <div className='flex'>
          <AlertCircle className='h-5 w-5 text-red-400' />
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-red-800'>{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  const progressBarColor = percentage => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className='bg-white shadow-lg rounded-lg p-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Usage Dashboard</h2>

      {/* Billing Period */}
      <div className='mb-8'>
        <h3 className='text-lg font-medium text-gray-700 mb-2'>Current Billing Period</h3>
        <div className='text-sm text-gray-600'>
          {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
        </div>
      </div>

      {/* Usage Metrics */}
      <div className='space-y-6'>
        {/* Transcription Hours */}
        <div>
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center'>
              <Clock className='h-5 w-5 text-indigo-600 mr-2' />
              <span className='text-sm font-medium text-gray-700'>Transcription Hours</span>
            </div>
            <span className='text-sm text-gray-600'>
              {usage.transcriptionHours.used}/{usage.transcriptionHours.total} hours
            </span>
          </div>
          <div className='h-2 bg-gray-200 rounded-full'>
            <div
              className={`h-2 rounded-full ${progressBarColor(usage.transcriptionHours.percentage)}`}
              style={{ width: `${usage.transcriptionHours.percentage}%` }}
            />
          </div>
        </div>

        {/* Usage Statistics Grid */}
        <div className='grid grid-cols-2 gap-4 mt-6'>
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center'>
              <FileText className='h-5 w-5 text-indigo-600 mr-2' />
              <span className='text-sm font-medium text-gray-700'>Transcriptions</span>
            </div>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>{usage.transcriptionCount}</p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center'>
              <BarChart2 className='h-5 w-5 text-indigo-600 mr-2' />
              <span className='text-sm font-medium text-gray-700'>Summaries</span>
            </div>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>{usage.summaryCount}</p>
          </div>
        </div>
      </div>

      {/* Usage Warning */}
      {usage.transcriptionHours.percentage >= 90 && (
        <div className='mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4'>
          <div className='flex'>
            <AlertCircle className='h-5 w-5 text-yellow-400' />
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                You are approaching your usage limit. Consider upgrading your plan to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageDashboard;
