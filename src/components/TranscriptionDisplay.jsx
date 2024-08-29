// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader, ChevronDown, ChevronUp, AlertCircle, FileBarChart, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { getPlaceholderTranscription } from '../lib/placeHolderTranscription';

const TranscriptionDisplay = ({ transcriptionUrl, onSummaryGenerated }) => {
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [transcriptionReport, setTranscriptionReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedResults, setExpandedResults] = useState({});
  const [transcriptionStatus, setTranscriptionStatus] = useState('NotStarted');
  const [isSummarising, setIsSummarising] = useState(false);
  const [summarisationError, setSummarisationError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);
  const [scrollableResults, setScrollableResults] = useState({});
  const [hasScrolled, setHasScrolled] = useState({});
  const resultRefs = useRef({});
  const [editableTranscriptions, setEditableTranscriptions] = useState([]);

  useEffect(() => {
    if (transcriptionUrl) {
      checkTranscriptionStatus();
    } else {
      // Use placeholder data when there's no transcriptionUrl
      const placeholderData = getPlaceholderTranscription();
      setTranscriptionResults(placeholderData);
      setTranscriptionStatus('Completed');
    }
  }, [transcriptionUrl]);

  useEffect(() => {
    const checkScrollable = () => {
      const newScrollableResults = {};
      Object.keys(expandedResults).forEach(index => {
        if (expandedResults[index] && resultRefs.current[index]) {
          const { scrollHeight, clientHeight } = resultRefs.current[index];
          newScrollableResults[index] = scrollHeight > clientHeight;
        }
      });
      setScrollableResults(newScrollableResults);
    };

    const handleScroll = index => {
      setHasScrolled(prev => ({ ...prev, [index]: true }));
    };

    Object.keys(expandedResults).forEach(index => {
      if (expandedResults[index] && resultRefs.current[index]) {
        resultRefs.current[index].addEventListener('scroll', () => handleScroll(index));
      }
    });

    checkScrollable();
    window.addEventListener('resize', checkScrollable);

    return () => {
      window.removeEventListener('resize', checkScrollable);
      Object.keys(expandedResults).forEach(index => {
        if (resultRefs.current[index]) {
          resultRefs.current[index].removeEventListener('scroll', () => handleScroll(index));
        }
      });
    };
  }, [expandedResults, transcriptionResults]);

  const formatTranscriptionWithSpeakers = result => {
    if (!result || !result.content) {
      console.error('Invalid transcription result structure:', result);
      return []; // Return an empty array if the structure is invalid
    }

    let recognizedPhrases = result.content.recognizedPhrases;

    // Handle placeholder data structure
    if (!recognizedPhrases && result.content.combinedRecognizedPhrases) {
      recognizedPhrases = [
        {
          offsetInTicks: 0,
          speaker: 'Speaker 1',
          nBest: [{ display: result.content.combinedRecognizedPhrases[0].display }],
        },
      ];
    }

    if (!recognizedPhrases) {
      console.error('No recognized phrases found:', result);
      return [];
    }

    let formattedTranscription = [];
    let currentSpeaker = null;
    let currentText = '';
    let currentWordCount = 0;

    recognizedPhrases.forEach((phrase, index) => {
      if (!phrase || !phrase.nBest || phrase.nBest.length === 0) {
        console.warn('Invalid phrase structure:', phrase);
        return; // Skip this phrase if it's invalid
      }

      const speaker = `Speaker ${phrase.speaker || 'Unknown'}`;
      const timestamp = formatTimestamp(phrase.offsetInTicks);
      const wordCount = phrase.nBest[0].words
        ? phrase.nBest[0].words.length
        : phrase.nBest[0].display.split(' ').length;

      if (speaker !== currentSpeaker || index === recognizedPhrases.length - 1) {
        if (currentText) {
          formattedTranscription.push({
            speaker: currentSpeaker,
            timestamp: formatTimestamp(recognizedPhrases[formattedTranscription.length].offsetInTicks),
            text: currentText.trim(),
            wordCount: currentWordCount,
          });
        }
        currentSpeaker = speaker;
        currentText = phrase.nBest[0].display || '';
        currentWordCount = wordCount;
      } else {
        currentText += ' ' + (phrase.nBest[0].display || '');
        currentWordCount += wordCount;
      }
    });

    // Add the last segment if it wasn't added in the loop
    if (currentText) {
      formattedTranscription.push({
        speaker: currentSpeaker,
        timestamp: formatTimestamp(recognizedPhrases[recognizedPhrases.length - 1].offsetInTicks),
        text: currentText.trim(),
        wordCount: currentWordCount,
      });
    }

    return formattedTranscription;
  };

  const formatTimestamp = offsetInTicks => {
    const totalSeconds = Math.floor(offsetInTicks / 10000000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `[${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}]`;
  };

  useEffect(() => {
    if (transcriptionResults.length > 0) {
      const formattedResults = transcriptionResults.map(result => ({
        fileName: result.fileName,
        content: formatTranscriptionWithSpeakers(result),
      }));
      setEditableTranscriptions(formattedResults);
    }
  }, [transcriptionResults]);

  const handleEdit = (fileIndex, segmentIndex, field, value) => {
    setEditableTranscriptions(prev => {
      const newTranscriptions = [...prev];
      newTranscriptions[fileIndex].content[segmentIndex][field] = value;
      return newTranscriptions;
    });
  };

  const renderEditableTranscription = (transcription, fileIndex) => {
    return transcription.content.map((segment, segmentIndex) => (
      <div key={segmentIndex} className='mb-4 p-2 bg-indigo-50 rounded'>
        <div className='flex items-center mb-2'>
          <span className='text-gray-500 mr-2'>{segment.timestamp}</span>
          <input
            className='font-semibold text-indigo-600 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500'
            value={segment.speaker}
            onChange={e => handleEdit(fileIndex, segmentIndex, 'speaker', e.target.value)}
          />
        </div>
        <textarea
          className='text-indigo-800 bg-transparent border border-indigo-300 focus:outline-none focus:border-indigo-500 w-full p-2 rounded'
          value={segment.text}
          onChange={e => handleEdit(fileIndex, segmentIndex, 'text', e.target.value)}
          rows={Math.min(10, segment.text.split('\n').length)}
        />
        <div className='text-sm text-gray-500 mt-1'>Word count: {segment.wordCount}</div>
      </div>
    ));
  };

  const toggleResultExpansion = index => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index],
    }));

    // Reset hasScrolled state when toggling expansion
    setHasScrolled(prev => ({ ...prev, [index]: false }));
  };

  const checkTranscriptionStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/transcription-status?transcriptionUrl=${encodeURIComponent(transcriptionUrl)}`
      );
      const text = await response.text();
      console.log('Raw response:', text);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      }

      const data = JSON.parse(text);
      console.log('Parsed data:', data);

      setTranscriptionStatus(data.status);

      switch (data.status) {
        case 'NotStarted':
        case 'Running':
          // Continue checking status after a delay
          setTimeout(checkTranscriptionStatus, 10000); // Check every 10 seconds
          break;
        case 'Succeeded':
          // Fetch results when the transcription is complete
          await fetchTranscriptionResults();
          break;
        case 'Failed':
        case 'Cancelled':
          setError(`Transcription ${data.status.toLowerCase()}. Please try again.`);
          break;
        default:
          console.warn(`Unknown transcription status: ${data.status}`);
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setError(`Failed to check transcription status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTranscriptionResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Get the list of result files
      const filesResponse = await fetch(`${transcriptionUrl}/files`, {
        headers: {
          'Ocp-Apim-Subscription-Key': import.meta.env.VITE_SPEECH_KEY,
        },
      });
      if (!filesResponse.ok) {
        throw new Error(`HTTP error! status: ${filesResponse.status}`);
      }
      const filesData = await filesResponse.json();

      // Step 2: Handle pagination if necessary
      let allFiles = filesData.values;
      let nextLink = filesData.nextLink;
      while (nextLink) {
        const nextResponse = await fetch(nextLink, {
          headers: {
            'Ocp-Apim-Subscription-Key': import.meta.env.VITE_SPEECH_KEY,
          },
        });
        if (!nextResponse.ok) {
          throw new Error(`HTTP error! status: ${nextResponse.status}`);
        }
        const nextData = await nextResponse.json();
        allFiles = [...allFiles, ...nextData.values];
        nextLink = nextData.nextLink;
      }

      // Step 3: Filter for transcription files and the report file
      const transcriptionFiles = allFiles.filter(file => file.kind === 'Transcription');
      const reportFile = allFiles.find(file => file.kind === 'TranscriptionReport');

      // Step 4: Fetch content for each transcription file and the report
      const results = await Promise.all(
        transcriptionFiles.map(async file => {
          const contentResponse = await fetch(file.links.contentUrl, {
            headers: {
              'Ocp-Apim-Subscription-Key': import.meta.env.VITE_SPEECH_KEY,
            },
          });
          if (!contentResponse.ok) {
            throw new Error(`HTTP error! status: ${contentResponse.status}`);
          }
          const content = await contentResponse.json();
          return { fileName: file.name, content };
        })
      );

      // Fetch report content
      if (reportFile) {
        const reportResponse = await fetch(reportFile.links.contentUrl, {
          headers: {
            'Ocp-Apim-Subscription-Key': import.meta.env.VITE_SPEECH_KEY,
          },
        });
        if (!reportResponse.ok) {
          throw new Error(`HTTP error! status: ${reportResponse.status}`);
        }
        const reportContent = await reportResponse.json();
        setTranscriptionReport(reportContent);
      }

      setTranscriptionResults(results);
    } catch (error) {
      console.error('Error fetching transcription results:', error);
      setError('Failed to fetch transcription results. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = durationInTicks => {
    const seconds = durationInTicks / 10000000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderTranscriptionReport = () => {
    if (!transcriptionReport) return null;

    return (
      <div className='mt-4 p-4 bg-indigo-50 rounded-lg'>
        <h3 className='text-lg font-semibold text-indigo-700 flex items-center mb-2'>
          <FileBarChart className='mr-2' />
          Transcription Report
        </h3>
        <p className='text-sm text-indigo-600'>
          Successful Transcriptions: {transcriptionReport.successfulTranscriptionsCount}
        </p>
        <p className='text-sm text-indigo-600'>
          Failed Transcriptions: {transcriptionReport.failedTranscriptionsCount}
        </p>
        {transcriptionReport.details && (
          <div className='mt-2'>
            <h4 className='text-md font-semibold text-indigo-600'>Details:</h4>
            <ul className='list-disc list-inside'>
              {transcriptionReport.details.map((detail, index) => (
                <li key={index} className='text-sm text-indigo-600'>
                  {detail.source}: {detail.status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const handleSummarise = async () => {
    setIsSummarising(true);
    setSummarisationError(null);
    setRetryAfter(null);
    try {
      console.log('Starting summarisation process');
      const response = await axios.post('http://localhost:3000/api/summarise', { transcriptionResults });
      console.log('Summarisation completed');
      onSummaryGenerated(response.data.summary.trim());
    } catch (error) {
      console.error('Error generating summary:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        if (error.response.status === 429) {
          setSummarisationError('Rate limit exceeded. Please try again later.');
          setRetryAfter(error.response.data.retryAfter);
        } else {
          setSummarisationError('An error occurred while generating the summary. Please try again.');
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setSummarisationError('No response received from the server. Please try again.');
      } else {
        console.error('Error message:', error.message);
        setSummarisationError('An error occurred while sending the request. Please try again.');
      }
    } finally {
      setIsSummarising(false);
    }
  };

  const formatRetryTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours and ${minutes} minutes`;
  };

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
        <FileText className='mr-2' />
        {transcriptionUrl ? 'Transcription Results' : 'Placeholder Transcription'}
      </h2>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader className='animate-spin text-indigo-600' size={48} />
        </div>
      ) : error ? (
        <div className='text-red-600 text-center flex items-center justify-center'>
          <AlertCircle className='mr-2' />
          {error}
        </div>
      ) : (
        <div className='space-y-4'>
          <p className='text-indigo-600 font-semibold'>Status: {transcriptionStatus}</p>
          {renderTranscriptionReport()}
          {editableTranscriptions.map((result, index) => (
            <div key={index} className='border border-indigo-200 rounded-lg p-4 mt-4'>
              <div
                className='flex justify-between items-center cursor-pointer'
                onClick={() => toggleResultExpansion(index)}>
                <h3 className='text-lg font-semibold text-indigo-600'>{result.fileName}</h3>
                {expandedResults[index] ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedResults[index] && (
                <div className='mt-2 space-y-2'>
                  <div
                    ref={el => (resultRefs.current[index] = el)}
                    className='bg-indigo-50 p-3 rounded-md max-h-[500px] overflow-y-auto'>
                    {renderEditableTranscription(result, index)}
                  </div>
                  {scrollableResults[index] && !hasScrolled[index] && (
                    <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-indigo-50 to-transparent pointer-events-none flex justify-center items-end'>
                      <ChevronDown className='text-indigo-600 animate-bounce mb-2' size={24} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {transcriptionResults.length > 0 && !isLoading && !error && (
        <div className='mt-4'>
          <button
            onClick={handleSummarise}
            disabled={isSummarising || retryAfter}
            className={`bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center w-full sm:w-auto ${
              (isSummarising || retryAfter) && 'opacity-50 cursor-not-allowed'
            }`}>
            {isSummarising ? (
              <Loader className='animate-spin mr-2' size={18} />
            ) : (
              <Lightbulb className='mr-2' size={18} />
            )}
            {isSummarising ? 'Summarising...' : 'Summarise Transcriptions'}
          </button>
          {summarisationError && (
            <p className='text-red-600 mt-2 flex items-center'>
              <AlertCircle className='mr-2' size={18} />
              {summarisationError}
            </p>
          )}
          {retryAfter && (
            <p className='text-indigo-600 mt-2'>You can try again in approximately {formatRetryTime(retryAfter)}.</p>
          )}
        </div>
      )}

      {transcriptionResults.length === 0 && !isLoading && !error && (
        <p className='text-center text-gray-600'>No transcription results available yet.</p>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
