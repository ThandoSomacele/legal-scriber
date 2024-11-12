import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Loader, AlertCircle, Lightbulb, Mic, Clock, Timer, Edit2, Check, X } from 'lucide-react';
import apiClient from '../apiClient';
import Disclaimer from './Disclaimer';

// Reusable component for editable speaker names
const EditableSpeaker = ({ originalName, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(originalName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(name);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(originalName);
    setIsEditing(false);
  };

  return isEditing ? (
    <div className='flex items-center space-x-2'>
      <input
        ref={inputRef}
        type='text'
        value={name}
        onChange={e => setName(e.target.value)}
        className='px-2 py-1 text-sm border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        onKeyPress={e => e.key === 'Enter' && handleSave()}
      />
      <button onClick={handleSave} className='p-1 text-green-600 hover:text-green-700' title='Save'>
        <Check className='w-4 h-4' />
      </button>
      <button onClick={handleCancel} className='p-1 text-red-600 hover:text-red-700' title='Cancel'>
        <X className='w-4 h-4' />
      </button>
    </div>
  ) : (
    <div className='flex items-center space-x-2'>
      <span className='font-medium text-indigo-700'>{name}</span>
      <button
        onClick={() => setIsEditing(true)}
        className='p-1 text-gray-500 hover:text-indigo-600'
        title='Edit speaker name'>
        <Edit2 className='w-4 h-4' />
      </button>
    </div>
  );
};

// Enhanced transcription content component with diarisation
const TranscriptionContent = ({ content, updateSpeakerName }) => {
  const [speakerMap, setSpeakerMap] = useState({});

  // Format timestamp function
  const formatTime = seconds => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle speaker name updates
  const handleSpeakerUpdate = (speakerId, newName) => {
    setSpeakerMap(prev => ({ ...prev, [speakerId]: newName }));
    if (updateSpeakerName) {
      updateSpeakerName(speakerId, newName);
    }
  };

  // Render speaker's name or number
  const getSpeakerDisplay = speakerId => {
    // First check if we have a custom name in our map
    if (speakerMap[speakerId]) {
      return speakerMap[speakerId];
    }

    // Convert speakerId to string to ensure we can use includes
    const speakerIdString = String(speakerId);

    // Check if it already has "Speaker" prefix
    if (speakerIdString.includes('Speaker')) {
      return speakerIdString;
    }

    // If it's just a number or other identifier, format it as "Speaker X"
    return `Speaker ${speakerIdString}`;
  };

  if (!content) {
    return <p className='text-gray-600'>No transcription content available.</p>;
  }

  try {
    const contentObject = JSON.parse(content);
    if (!contentObject.recognizedPhrases?.length) {
      return <p className='text-gray-600'>No phrases found in transcription.</p>;
    }

    return (
      <div className='bg-indigo-50 p-4 rounded-md max-h-96 overflow-y-auto space-y-4'>
        {contentObject.recognizedPhrases.map((phrase, index) => {
          const startTime = Math.floor(phrase.offsetInTicks / 10000000);
          const duration = Math.floor(phrase.durationInTicks / 10000000);
          // Extract speaker information - the API will return a number for identified speakers
          const speakerId = phrase.speaker ? `Speaker ${phrase.speaker}` : `Speaker ${index + 1}`;

          return (
            <div key={index} className='bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-2'>
                <EditableSpeaker
                  originalName={speakerMap[speakerId] || speakerId}
                  onSave={newName => handleSpeakerUpdate(speakerId, newName)}
                />
                <div className='flex items-center text-sm text-indigo-600 mt-2 sm:mt-0'>
                  <Clock className='w-4 h-4 mr-1' />
                  <span>{formatTime(startTime)}</span>
                  <span className='mx-1'>-</span>
                  <span>{formatTime(startTime + duration)}</span>
                </div>
              </div>
              <p className='text-gray-800 pl-4 border-l-4 border-indigo-100'>{phrase.nBest[0].display}</p>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    console.error('Error parsing transcription content:', e);
    return <p className='text-gray-600'>Error displaying transcription content.</p>;
  }
};

// Processing status component
const ProcessingStatus = ({ estimatedTime, audioFilesCount, calculateEstimatedTime }) => {
  const dotsRef = useRef('');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      dotsRef.current = dotsRef.current.length >= 3 ? '' : dotsRef.current + '.';
      setDots(dotsRef.current);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = seconds => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return seconds < 60
      ? `About ${seconds} seconds remaining`
      : `About ${minutes}:${remainingSeconds.toString().padStart(2, '0')} minutes remaining`;
  };

  const progress = Math.max(10, Math.min(90, 100 - (estimatedTime / calculateEstimatedTime(audioFilesCount)) * 100));

  return (
    <div className='bg-indigo-50 p-6 rounded-lg'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          <div className='absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25'></div>
          <Mic className='w-12 h-12 text-indigo-600 relative z-10 animate-pulse' />
        </div>

        <div className='space-y-2 text-center'>
          <h3 className='text-lg font-medium text-indigo-700'>Processing Audio{dots}</h3>
          <p className='text-sm text-indigo-600'>Converting your audio to text</p>

          <div className='flex items-center justify-center text-sm text-indigo-500 mt-2'>
            <Timer className='w-4 h-4 mr-1' />
            <span>{formatTimeRemaining(estimatedTime)}</span>
          </div>

          <div className='text-xs text-indigo-400 mt-1'>
            {audioFilesCount > 1 ? `Processing ${audioFilesCount} audio files` : 'Processing audio file'}
          </div>
        </div>

        <div className='w-full max-w-md h-2 bg-indigo-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-indigo-600 rounded-full transition-all duration-1000'
            style={{ width: `${progress}%` }}
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
};

// Main TranscriptionDisplay component
const TranscriptionDisplay = ({ transcriptionId, onSummaryGenerated, meetingType }) => {
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [speakerNames, setSpeakerNames] = useState({});

  const calculateEstimatedTime = useCallback(audioUrlsCount => {
    const baseTime = 30;
    const perFileTime = 20;
    return baseTime + audioUrlsCount * perFileTime;
  }, []);

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

  useEffect(() => {
    if (transcription?.audioFileUrls && !startTime) {
      const initialEstimate = calculateEstimatedTime(transcription.audioFileUrls.length);
      setEstimatedTime(initialEstimate);
      setStartTime(Date.now());
    }
  }, [transcription?.audioFileUrls, startTime, calculateEstimatedTime]);

  const fetchTranscription = useCallback(async () => {
    if (!transcriptionId) return;

    try {
      const response = await apiClient.get(`/api/transcriptions/${transcriptionId}`);
      setTranscription(response.data);
      localStorage.setItem('transcription', JSON.stringify(response.data));

      if (response.data.status === 'processing' || response.data.status === 'submitted') {
        setTimeout(fetchTranscription, 10000);
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
    const storedTranscription = localStorage.getItem('transcription');
    if (storedTranscription) {
      setTranscription(JSON.parse(storedTranscription));
      setIsLoading(false);
    }

    fetchTranscription();
  }, [fetchTranscription]);

  const handleSpeakerNameUpdate = (speakerId, newName) => {
    setSpeakerNames(prev => ({
      ...prev,
      [speakerId]: newName,
    }));
    // Here you could add persistence logic if needed
  };

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
        <ProcessingStatus
          estimatedTime={estimatedTime}
          audioFilesCount={transcription?.audioFileUrls?.length || 1}
          calculateEstimatedTime={calculateEstimatedTime}
        />
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
              <TranscriptionContent
                content={transcription.content[index]}
                updateSpeakerName={handleSpeakerNameUpdate}
              />
            </div>
          ))}
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className='mt-4 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium 
                     rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'>
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
