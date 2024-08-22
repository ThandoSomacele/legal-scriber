import React, { useState, useEffect } from 'react';
import { FileText, Loader, ChevronDown, ChevronUp, AlertCircle, FileBarChart, Lightbulb } from 'lucide-react';
import axios from 'axios';

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

  useEffect(() => {
    let statusCheckTimer;

    if (transcriptionUrl) {
      checkTranscriptionStatus();
    }

    return () => {
      if (statusCheckTimer) {
        clearTimeout(statusCheckTimer);
      }
    };
  }, [transcriptionUrl]);

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

  const toggleResultExpansion = index => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatDuration = durationInTicks => {
    const seconds = durationInTicks / 10000000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // New function to render the transcription report
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
      console.log('Sending data to summarise:', { transcriptionResults });
      const response = await axios.post('http://localhost:3000/api/summarise', { transcriptionResults });
      console.log('Received summary:', response.data);
      onSummaryGenerated(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        if (error.response.status === 429) {
          setSummarisationError('Rate limit exceeded for GPT-4 Turbo. Please try again later.');
          setRetryAfter(error.response.data.retryAfter);
        } else {
          setSummarisationError(
            `Server error: ${error.response.status}. ${error.response.data.error || 'Please try again.'}`
          );
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
        Transcription Results
      </h2>

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
                  <div className='bg-indigo-50 p-3 rounded-md'>
                    <p className='text-indigo-800 whitespace-pre-wrap'>
                      {result.content.combinedRecognizedPhrases[0].display}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {transcriptionResults.length === 0 && !isLoading && !error && (
        <p className='text-center text-gray-600'>No transcription results available yet.</p>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
