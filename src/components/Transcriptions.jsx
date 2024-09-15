import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader, AlertCircle } from 'lucide-react';
import apiClient from '../apiClient';

const Transcriptions = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await apiClient.get('/api/transcriptions');
        setTranscriptions(response.data);
      } catch (error) {
        console.error('Error fetching transcriptions:', error);
        setError('Failed to fetch transcriptions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscriptions();
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
      <h1 className='text-3xl font-bold text-indigo-800 mb-6'>Your Transcriptions</h1>
      {transcriptions.length === 0 ? (
        <p className='text-gray-600'>You don't have any transcriptions yet.</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {transcriptions.map(transcription => (
            <div key={transcription._id} className='bg-white shadow-md rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-indigo-700 mb-2'>{transcription.meetingType} Transcription</h2>
              <p className='text-gray-600 mb-2'>Status: {transcription.status}</p>
              <p className='text-gray-600 mb-4'>Created: {new Date(transcription.createdAt).toLocaleString()}</p>
              <Link
                to={`/transcriptions/${transcription._id}`}
                className='text-indigo-600 hover:text-indigo-800 flex items-center'>
                <FileText className='mr-2' size={18} />
                View Transcription
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transcriptions;
