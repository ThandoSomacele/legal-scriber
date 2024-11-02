import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Loader, AlertCircle, Lightbulb, Mic, Clock, Timer } from 'lucide-react';
import apiClient from '../apiClient';
import Disclaimer from './Disclaimer';

const TranscriptionDisplay = ({ transcriptionId, onSummaryGenerated, meetingType }) => {
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [progressDots, setProgressDots] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Calculate estimated completion time
  const calculateEstimatedTime = useCallback(audioUrls => {
    // Rough estimation:
    // - Base processing time: 30 seconds
    // - Per file processing time: 20 seconds
    // - Processing ratio: Real-time duration × 0.5 (half of audio length)
    const baseTime = 30; // seconds
    const perFileTime = 20; // seconds
    const processingRatio = 0.5;

    // Calculate total files processing time
    const totalFiles = audioUrls?.length || 0;
    const filesProcessingTime = totalFiles * perFileTime;

    // Set initial rough estimate
    let initialEstimate = baseTime + filesProcessingTime;
    setEstimatedTime(initialEstimate);

    // Start the processing timer
    setStartTime(Date.now());

    return initialEstimate;
  }, []);

  // Update remaining time
  useEffect(() => {
    let interval;
    if (
      startTime &&
      estimatedTime &&
      (transcription?.status === 'processing' || transcription?.status === 'submitted')
    ) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remainingSeconds = Math.max(0, estimatedTime - elapsedSeconds);
        setEstimatedTime(remainingSeconds);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, estimatedTime, transcription?.status]);

  // Initialize estimation when transcription starts
  useEffect(() => {
    if (transcription?.audioFileUrls && !startTime) {
      calculateEstimatedTime(transcription.audioFileUrls);
    }
  }, [transcription?.audioFileUrls, calculateEstimatedTime, startTime]);

  // Format time display
  const formatTimeRemaining = seconds => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return seconds < 60
      ? `About ${seconds} seconds remaining`
      : `About ${minutes}:${remainingSeconds.toString().padStart(2, '0')} minutes remaining`;
  };

  // Processing status component with time estimation
  const ProcessingStatus = () => (
    <div className='bg-indigo-50 p-6 rounded-lg'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          <div className='absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25'></div>
          <Mic className='w-12 h-12 text-indigo-600 relative z-10 animate-pulse' />
        </div>

        <div className='space-y-2 text-center'>
          <h3 className='text-lg font-medium text-indigo-700'>Processing Audio{progressDots}</h3>
          <p className='text-sm text-indigo-600'>Converting your audio to text</p>

          {/* Estimated Time Display */}
          <div className='flex items-center justify-center text-sm text-indigo-500 mt-2'>
            <Timer className='w-4 h-4 mr-1' />
            <span>{formatTimeRemaining(estimatedTime)}</span>
          </div>

          {/* Processing Progress Indicator */}
          <div className='text-xs text-indigo-400 mt-1'>
            {transcription?.audioFileUrls?.length > 1
              ? `Processing ${transcription.audioFileUrls.length} audio files`
              : 'Processing audio file'}
          </div>
        </div>

        {/* Progress bar */}
        <div className='w-full max-w-md h-2 bg-indigo-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-indigo-600 rounded-full transition-all duration-1000'
            style={{
              width: `${Math.max(
                10,
                Math.min(90, 100 - (estimatedTime / calculateEstimatedTime(transcription?.audioFileUrls)) * 100)
              )}%`,
            }}
          />
        </div>

        <div className='flex space-x-2'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='w-2 h-2 bg-indigo-600 rounded-full animate-bounce'
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Animate the progress dots
  useEffect(() => {
    let interval;
    if (transcription?.status === 'processing' || transcription?.status === 'submitted') {
      interval = setInterval(() => {
        setProgressDots(dots => (dots.length >= 3 ? '' : dots + '.'));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [transcription?.status]);

  const fetchTranscription = useCallback(async () => {
    if (!transcriptionId) return;

    try {
      const response = await apiClient.get(`/api/transcriptions/${transcriptionId}`);
      setTranscription(response.data);

      // Store the transcription data in localStorage
      localStorage.setItem('transcription', JSON.stringify(response.data));

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
    // Try to load transcription from localStorage on component mount
    const storedTranscription = localStorage.getItem('transcription');
    if (storedTranscription) {
      setTranscription(JSON.parse(storedTranscription));
      setIsLoading(false);
    }

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
      setError(error.response?.data?.message || 'Failed to generate summary. Please try again later.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Enhanced transcription content renderer with timestamp formatting
  const renderTranscriptionContent = content => {
    if (!content) {
      return <p className='text-gray-600'>No transcription content available.</p>;
    }

    try {
      const contentObject = JSON.parse(content);
      if (contentObject.combinedRecognizedPhrases && contentObject.combinedRecognizedPhrases.length > 0) {
        return (
          <div className='bg-indigo-50 p-4 rounded-md max-h-96 overflow-y-auto'>
            {contentObject.recognizedPhrases?.map((phrase, index) => {
              // Convert ticks to seconds (assuming ticks are in 100-nanosecond units)
              const startTime = Math.floor(phrase.offsetInTicks / 10000000);
              const duration = Math.floor(phrase.durationInTicks / 10000000);
              const endTime = startTime + duration;

              // Format timestamp
              const formatTime = seconds => {
                const hrs = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
                  .toString()
                  .padStart(2, '0')}`;
              };

              return (
                <div key={index} className='mb-4 hover:bg-indigo-100 p-2 rounded-lg transition-colors'>
                  <div className='flex items-center text-sm text-indigo-600 mb-1'>
                    <Clock className='w-4 h-4 mr-1' />
                    <span>
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </span>
                  </div>
                  <p className='text-gray-800'>{phrase.nBest[0].display}</p>
                </div>
              );
            })}
          </div>
        );
      }
      return <p className='text-gray-600'>{content}</p>;
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

      <Disclaimer type='transcription' />

      {!transcriptionId ? (
        <div className='bg-indigo-50 p-4 rounded-md'>
          <p className='text-indigo-700'>
            Your transcription will appear here once you've uploaded and processed an audio file. The transcription will
            convert your {meetingType === 'legal' ? 'legal hearing' : 'meeting'} audio into text, making it easy to
            review and analyse.
          </p>
        </div>
      ) : isLoading ? (
        <div className='flex flex-col items-center justify-center h-64'>
          <Loader className='animate-spin text-indigo-600 mb-4' size={48} />
          <span className='text-lg text-indigo-600'>Fetching transcription status...</span>
        </div>
      ) : transcription?.status === 'processing' || transcription?.status === 'submitted' ? (
        <ProcessingStatus />
      ) : transcription?.status === 'completed' ? (
        <>
          <div className='mb-4'>
            <p className='text-gray-600'>
              <strong>Meeting Type:</strong> {transcription.meetingType}
            </p>
          </div>
          {transcription.audioFileUrls.map((url, index) => (
            <div key={index} className='mb-6'>
              <h3 className='text-lg font-semibold text-indigo-600 mb-2'>Audio File {index + 1}</h3>
              {renderTranscriptionContent(transcription.content[index])}
            </div>
          ))}
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className='mt-4 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            {isSummarizing ? (
              <>
                <Loader className='animate-spin mr-2' size={18} />
                Summarising...
              </>
            ) : (
              <>
                <Lightbulb className='mr-2' size={18} />
                Generate Summary
              </>
            )}
          </button>
        </>
      ) : (
        <div className='bg-red-50 p-4 rounded-md'>
          <p className='text-red-700'>
            There was an issue with your transcription: {transcription?.errorDetails || 'Unknown error'}
          </p>
          <p className='text-red-700 mt-2'>Please try uploading your audio files again.</p>
        </div>
      )}

      {error && (
        <div className='mt-4 p-4 bg-red-100 text-red-700 rounded-md'>
          <p className='text-sm flex items-center'>
            <AlertCircle className='mr-2' size={18} />
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
