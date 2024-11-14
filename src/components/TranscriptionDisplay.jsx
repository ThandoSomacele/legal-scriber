import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Loader,
  AlertCircle,
  Lightbulb,
  Mic,
  Clock,
  ChevronDown,
  ArrowUp,
  Edit2, // Add this
  Check, // Add this
  X, // Add this
} from 'lucide-react';
import apiClient from '../apiClient';
import Disclaimer from './Disclaimer';

// ScrollIndicator component with enhanced visibility
const ScrollIndicator = () => (
  <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center'>
    <div className='text-sm font-medium text-indigo-600 mb-1 animate-pulse'>Scroll for more</div>
    <div className='flex flex-col items-center'>
      <ChevronDown className='w-6 h-6 text-indigo-600 animate-bounce-slow' />
      <ChevronDown className='w-6 h-6 text-indigo-600 -mt-3 animate-bounce-slow delay-100' />
    </div>
  </div>
);

// ScrollToTop button component positioned relative to container
const ScrollToTopButton = ({ onClick, isVisible }) => (
  <button
    onClick={onClick}
    className={`absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-full shadow-lg 
                hover:bg-indigo-700 transition-all duration-300 transform 
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                group hover:scale-110`}
    aria-label='Scroll to top'>
    <ArrowUp className='w-5 h-5' />
    {/* <span
      className='absolute -top-8 right-0 bg-gray-900 text-white text-sm py-1 px-2 rounded opacity-0 
                     group-hover:opacity-100 transition-opacity duration-200'>
      Back to top
    </span> */}
  </button>
);

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

// Enhanced transcription content component with improved diarization
// Enhanced TranscriptionContent component with scroll features
const TranscriptionContent = ({ content, updateSpeakerName }) => {
  // State to store speaker mappings and custom names
  const [speakerMap, setSpeakerMap] = useState({});
  // Counter to keep track of unique speakers
  const [speakerCount, setSpeakerCount] = useState(0);
  // Map to store speaker roles (if available in transcription)
  const [speakerRoles, setSpeakerRoles] = useState({});
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef(null);

  // Add custom styles for scrollbar and container
  const containerStyles = `
   relative 
   bg-indigo-50 
   p-4 
   rounded-md 
   h-96 
   overflow-y-auto 
   scroll-smooth
   scrollbar-thin 
   scrollbar-thumb-indigo-600 
   scrollbar-track-indigo-100
 `;

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setShowScrollIndicator(isScrollable);
      }
    };

    checkScrollable();
    // Recheck when content changes or window resizes
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [content]);

  // Handle scroll events
  const handleScroll = e => {
    const scrollTop = e.target.scrollTop;
    setShowScrollTop(scrollTop > 200);

    // Hide scroll indicator once user starts scrolling
    if (scrollTop > 20) {
      setShowScrollIndicator(false);
    }
  };

  // Smooth scroll to top
  const scrollToTop = () => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Initialize speaker identification on content load
  useEffect(() => {
    if (content) {
      try {
        const contentObject = JSON.parse(content);
        const speakers = new Set();

        // Extract unique speakers from the transcription
        contentObject.recognizedPhrases?.forEach(phrase => {
          if (phrase.speaker) {
            speakers.add(phrase.speaker);
          }
        });

        // Initialize speaker count and basic role mapping
        setSpeakerCount(speakers.size);
        const initialRoles = {};
        speakers.forEach(speaker => {
          initialRoles[speaker] = `Speaker ${speaker}`;
        });
        setSpeakerRoles(initialRoles);
      } catch (error) {
        console.error('Error processing speakers:', error);
      }
    }
  }, [content]);

  // Format timestamp for display
  const formatTime = seconds => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle speaker name updates with persistence
  const handleSpeakerUpdate = (speakerId, newName) => {
    setSpeakerMap(prev => {
      const updated = { ...prev, [speakerId]: newName };
      // Store in localStorage for persistence across sessions
      localStorage.setItem('speakerMap', JSON.stringify(updated));
      return updated;
    });
    if (updateSpeakerName) {
      updateSpeakerName(speakerId, newName);
    }
  };

  // Get display name for a speaker
  const getSpeakerDisplay = speakerId => {
    // Check custom name mapping first
    if (speakerMap[speakerId]) {
      return speakerMap[speakerId];
    }
    // Then check role mapping
    if (speakerRoles[speakerId]) {
      return speakerRoles[speakerId];
    }
    // Default to basic speaker number
    return `Speaker ${speakerId}`;
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
      <div className='relative'>
        <div ref={contentRef} onScroll={handleScroll} className={containerStyles}>
          {/* Your existing content rendering code */}
          {contentObject.recognizedPhrases.map((phrase, index) => {
            const startTime = Math.floor(phrase.offsetInTicks / 10000000);
            const duration = Math.floor(phrase.durationInTicks / 10000000);
            const speakerId = phrase.speaker || `Speaker ${index + 1}`;

            return (
              <div key={index} className='bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-2'>
                  <EditableSpeaker originalName={speakerId} onSave={newName => updateSpeakerName(speakerId, newName)} />
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

        {/* Enhanced scroll indicators */}
        {showScrollIndicator && (
          <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-indigo-50 pointer-events-none'>
            <ScrollIndicator />
          </div>
        )}

        {/* Repositioned scroll to top button */}
        <ScrollToTopButton onClick={scrollToTop} isVisible={showScrollTop} />
      </div>
    );
  } catch (e) {
    console.error('Error parsing transcription content:', e);
    return <p className='text-gray-600'>Error displaying transcription content.</p>;
  }
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

  // Handle transcription fetching
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

  // Handle speaker name updates
  const handleSpeakerNameUpdate = (speakerId, newName) => {
    setSpeakerNames(prev => ({
      ...prev,
      [speakerId]: newName,
    }));
  };

  // Handle summary generation
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
      ) : transcription?.status === 'completed' ? (
        <>
          <div className='mb-4'>
            <p className='text-gray-600'>
              <strong>Meeting Type:</strong> {transcription.meetingType}
            </p>
          </div>
          {transcription.content.map((content, index) => (
            <div key={index} className='mb-6'>
              <h3 className='text-lg font-semibold text-indigo-600 mb-2'>Audio File {index + 1}</h3>
              <TranscriptionContent content={content} updateSpeakerName={handleSpeakerNameUpdate} />
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

// Export both named components and default export
export { TranscriptionContent, EditableSpeaker };
export default TranscriptionDisplay;
