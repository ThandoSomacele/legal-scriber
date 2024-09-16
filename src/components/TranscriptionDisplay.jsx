import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Loader, AlertCircle, Lightbulb } from 'lucide-react';
import apiClient from '../apiClient';

const TranscriptionDisplay = ({ transcriptionId, onSummaryGenerated, meetingType }) => {
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const fetchTranscription = useCallback(async () => {
    if (!transcriptionId) return;

    try {
      const response = await apiClient.get(`/api/transcriptions/${transcriptionId}`);
      console.log('Fetched transcription:', response.data);
      setTranscription(response.data);

      // If the transcription is still processing, set up a timer to check again
      if (response.data.status === 'processing' || response.data.status === 'submitted') {
        setTimeout(fetchTranscription, 10000); // Check every 10 seconds
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
      setError('Failed to fetch transcription. Please try again later.');
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

  const renderTranscriptionContent = content => {
    if (!content) {
      return <p className='text-gray-600'>No transcription content available.</p>;
    }

    try {
      const contentObject = JSON.parse(content);
      if (contentObject.combinedRecognizedPhrases && contentObject.combinedRecognizedPhrases.length > 0) {
        return (
          <div className='bg-indigo-50 p-4 rounded-md max-h-96 overflow-y-auto'>
            {contentObject.combinedRecognizedPhrases.map((phrase, index) => (
              <p key={index} className='mb-2'>
                {phrase.display}
              </p>
            ))}
          </div>
        );
      } else {
        return <p className='text-gray-600'>{content}</p>;
      }
    } catch (e) {
      console.error('Error parsing transcription content:', e);
      return <p className='text-gray-600'>{content}</p>;
    }
  };

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
        <FileText className='mr-2' />
        Transcription Result
      </h2>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center h-64'>
          <Loader className='animate-spin text-indigo-600 mb-4' size={48} />
          <span className='text-lg text-indigo-600'>
            {transcription?.status === 'processing' || transcription?.status === 'submitted'
              ? 'Transcription in progress...'
              : 'Fetching transcription status...'}
          </span>
          <span className='text-sm text-gray-500 mt-2'>This may take a few minutes</span>
        </div>
      ) : error ? (
        <div className='text-red-600 text-center flex items-center justify-center'>
          <AlertCircle className='mr-2' />
          {error}
        </div>
      ) : transcription ? (
        <>
          <div className='mb-4'>
            <p className='text-gray-600'>
              <strong>Status:</strong> {transcription.status}
            </p>
            <p className='text-gray-600'>
              <strong>Meeting Type:</strong> {transcription.meetingType}
            </p>
          </div>
          {transcription.status === 'processing' || transcription.status === 'submitted' ? (
            <div className='bg-indigo-50 p-4 rounded-md'>
              <p className='text-indigo-700'>
                Your transcription is still being processed. This page will automatically update when it's ready.
              </p>
            </div>
          ) : transcription.status === 'completed' ? (
            <>
              {transcription.audioFileUrls.map((url, index) => (
                <div key={index} className='mb-6'>
                  <h3 className='text-lg font-semibold text-indigo-600 mb-2'>Audio File {index + 1}</h3>
                  {renderTranscriptionContent(transcription.content[index])}
                </div>
              ))}
            </>
          ) : (
            <div className='bg-red-50 p-4 rounded-md'>
              <p className='text-red-700'>
                There was an issue with your transcription: {transcription.errorDetails || 'Unknown error'}
              </p>
              <p className='text-red-700 mt-2'>Please try uploading your audio files again.</p>
            </div>
          )}
          {transcription.status === 'completed' && (
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
          )}
        </>
      ) : null}
    </div>
  );
};

export default TranscriptionDisplay;
