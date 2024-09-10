import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader, AlertCircle } from 'lucide-react';
import apiClient from '../apiClient';

const Summaries = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await apiClient.get('/api/summaries');
        setSummaries(response.data);
      } catch (error) {
        console.error('Error fetching summaries:', error);
        setError('Failed to fetch summaries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader className='animate-spin text-indigo-600' size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-red-600 text-center flex items-center justify-center'>
        <AlertCircle className='mr-2' />
        {error}
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold text-indigo-800 mb-6'>Your Summaries</h1>
      {summaries.length === 0 ? (
        <p className='text-gray-600'>You don't have any summaries yet.</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {summaries.map(summary => (
            <div key={summary._id} className='bg-white shadow-md rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-indigo-700 mb-2'>{summary.meetingType} Summary</h2>
              <p className='text-gray-600 mb-4'>Created: {new Date(summary.createdAt).toLocaleString()}</p>
              <Link
                to={`/summaries/${summary._id}`}
                className='text-indigo-600 hover:text-indigo-800 flex items-center'>
                <FileText className='mr-2' size={18} />
                View Summary
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Summaries;
