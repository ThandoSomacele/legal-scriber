// src/components/TranscriptionDisplay.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Loader, ChevronDown, AlertCircle, Lightbulb } from 'lucide-react';
import apiClient from '../apiClient';

const TranscriptionDisplay = ({ transcriptionId, onSummaryGenerated, meetingType }) => {
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const fetchTranscription = useCallback(async () => {
    if (!transcriptionId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/transcriptions/${transcriptionId}`);
      setTranscription(response.data);
    } catch (error) {
      console.error('Error fetching transcription:', error);
      setError('Failed to fetch transcription. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [transcriptionId]);

  useEffect(() => {
    fetchTranscription();
  }, [fetchTranscription]);

  const handleSummarize = async () => {
    if (!transcription) return;

    setIsSummarizing(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/summaries', {
        transcriptionId: transcription._id,
        meetingType,
      });
      onSummaryGenerated(response.data.summaryId);
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again later.');
    } finally {
      setIsSummarizing(false);
    }
  };

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

  if (!transcription) {
    return null;
  }

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
        <FileText className='mr-2' />
        Transcription Result
      </h2>
      <div className='mb-4'>
        <p className='text-gray-600'>
          <strong>Status:</strong> {transcription.status}
        </p>
        <p className='text-gray-600'>
          <strong>Meeting Type:</strong> {transcription.meetingType}
        </p>
      </div>
      <div className='bg-indigo-50 p-4 rounded-md max-h-96 overflow-y-auto'>
        <pre className='whitespace-pre-wrap'>{transcription.content}</pre>
      </div>
      <button
        onClick={handleSummarize}
        disabled={isSummarizing}
        className='mt-4 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
        {isSummarizing ? (
          <>
            <Loader className='animate-spin mr-2' size={18} />
            Summarizing...
          </>
        ) : (
          <>
            <Lightbulb className='mr-2' size={18} />
            Generate Summary
          </>
        )}
      </button>
    </div>
  );
};

export default TranscriptionDisplay;
