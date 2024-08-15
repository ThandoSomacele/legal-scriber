import React, { useState, useEffect } from 'react';
import { FileText, Loader, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const TranscriptionDisplay = ({ transcriptionUrl }) => {
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedResults, setExpandedResults] = useState({});
  const [transcriptionStatus, setTranscriptionStatus] = useState('NotStarted');

  useEffect(() => {
    if (transcriptionUrl) {
      checkTranscriptionStatus();
    }
  }, [transcriptionUrl]);

  const checkTranscriptionStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/transcription-status?transcriptionUrl=${encodeURIComponent(transcriptionUrl)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTranscriptionStatus(data.status);

      if (data.status === 'Succeeded') {
        await fetchTranscriptionResults();
      } else if (data.status === 'Running' || data.status === 'NotStarted') {
        // Check again after 10 seconds
        setTimeout(checkTranscriptionStatus, 10000);
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setError('Failed to check transcription status. Please try again later.');
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

      // Step 2: Filter for transcription files
      const transcriptionFiles = filesData.values.filter(file => file.kind === 'Transcription');

      // Step 3: Fetch content for each transcription file
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

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
        <FileText className='mr-2' />
        Transcription Results
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
