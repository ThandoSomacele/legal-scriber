// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader, ChevronDown, ChevronUp, AlertCircle, FileBarChart, Lightbulb } from 'lucide-react';
import apiClient from '../apiClient';
import { getLegalPlaceholderTranscription } from '../lib/legalPlaceHolderTranscription';
import { getExcoMeetingPlaceholderTranscription } from '../lib/excomeetingPlaceHolderTranscription';

const TranscriptionDisplay = ({ transcriptionUrl, onSummaryGenerated, summaryType }) => {
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

  useEffect(() => {
    if (transcriptionUrl) {
      checkTranscriptionStatus();
    } else {
      const placeholderData =
        summaryType === 'legal' ? getLegalPlaceholderTranscription() : getExcoMeetingPlaceholderTranscription();
      setTranscriptionResults(placeholderData);
      setTranscriptionStatus('Completed');
    }
  }, [transcriptionUrl, summaryType]);

  useEffect(() => {
    const checkScrollable = () => {
      const newScrollableResults = {};
      const newHasScrolled = {};
      Object.keys(expandedResults).forEach(index => {
        if (expandedResults[index] && resultRefs.current[index]) {
          const { scrollHeight, clientHeight, scrollTop } = resultRefs.current[index];
          newScrollableResults[index] = scrollHeight > clientHeight;
          newHasScrolled[index] = scrollTop > 0;
        }
      });
      setScrollableResults(newScrollableResults);
      setHasScrolled(newHasScrolled);
    };

    const handleScroll = index => {
      const { scrollTop, scrollHeight, clientHeight } = resultRefs.current[index];
      setHasScrolled(prev => ({
        ...prev,
        [index]: scrollTop > 0 || scrollHeight <= clientHeight,
      }));
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

  const toggleResultExpansion = index => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
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
          setTimeout(checkTranscriptionStatus, 10000);
          break;
        case 'Succeeded':
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
      const filesResponse = await fetch(`${transcriptionUrl}/files`, {
        headers: {
          'Ocp-Apim-Subscription-Key': import.meta.env.VITE_SPEECH_KEY,
        },
      });
      if (!filesResponse.ok) {
        throw new Error(`HTTP error! status: ${filesResponse.status}`);
      }
      const filesData = await filesResponse.json();

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

      const transcriptionFiles = allFiles.filter(file => file.kind === 'Transcription');
      const reportFile = allFiles.find(file => file.kind === 'TranscriptionReport');

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

      const response = await apiClient.post('/api/summarise', {
        transcriptionResults: transcriptionResults,
        summaryType: summaryType,
      });
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
        {transcriptionUrl
          ? 'Transcription Results'
          : `${summaryType === 'legal' ? 'Legal' : 'Meeting'} Placeholder Transcription`}
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
          {transcriptionResults.map((result, index) => (
            <div key={index} className='border border-indigo-200 rounded-lg p-4'>
              <div
                className='flex justify-between items-center cursor-pointer'
                onClick={() => toggleResultExpansion(index)}>
                <h3 className='text-lg font-semibold text-indigo-600'>{result.fileName}</h3>
                {expandedResults[index] ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedResults[index] && (
                <div className='mt-2 space-y-2'>
                  <p className='text-sm text-gray-600'>Duration: {formatDuration(result.content.durationInTicks)}</p>
                  <div className='relative'>
                    <div
                      ref={el => (resultRefs.current[index] = el)}
                      className='bg-indigo-50 p-3 rounded-md max-h-[500px] overflow-y-auto'>
                      <p className='text-indigo-800 whitespace-pre-wrap'>
                        {result.content.combinedRecognizedPhrases[0].display}
                      </p>
                    </div>
                    {scrollableResults[index] && !hasScrolled[index] && (
                      <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-indigo-50 to-transparent pointer-events-none flex justify-center items-end'>
                        <ChevronDown className='text-indigo-600 animate-bounce mb-2' size={24} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {transcriptionResults.length > 0 && !isLoading && !error && (
        <div className='mt-4'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-indigo-700 mb-2'>Select Summary Type:</h3>
            <div className='flex space-x-4'>
              <label className='inline-flex items-center'>
                <input
                  type='radio'
                  className='form-radio text-indigo-600'
                  name='summaryType'
                  value='legal'
                  checked={summaryType === 'legal'}
                  readOnly
                />
                <span className='ml-2'>Legal Hearing</span>
              </label>
              <label className='inline-flex items-center'>
                <input
                  type='radio'
                  className='form-radio text-indigo-600'
                  name='summaryType'
                  value='meeting'
                  checked={summaryType === 'meeting'}
                  readOnly
                />
                <span className='ml-2'>Meeting Minutes</span>
              </label>
            </div>
          </div>
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
            {isSummarising
              ? 'Summarising...'
              : `Summarise ${summaryType === 'legal' ? 'Legal Hearing' : 'Meeting Minutes'}`}
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
