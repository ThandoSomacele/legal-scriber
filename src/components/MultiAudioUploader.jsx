import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MultiAudioUploaderForm = ({ onTranscriptionCreated }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState(null);
  const [transcriptionUrl, setTranscriptionUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = event => {
    const files = Array.from(event.target.files);
    const newAudioFiles = files.filter(file => file.type.startsWith('audio/'));
    setAudioFiles(prevFiles => [...prevFiles, ...newAudioFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = index => {
    setAudioFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const uploadAndTranscribe = async files => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch('http://localhost:3000/upload-and-transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.transcriptionUrl;
  };

  const checkTranscriptionStatus = async url => {
    try {
      const response = await fetch(
        `http://localhost:3000/transcription-status?transcriptionUrl=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error checking transcription status:', error);
      throw error;
    }
  };

  useEffect(() => {
    let intervalId;

    if (['NotStarted', 'Running'].includes(transcriptionStatus) && transcriptionUrl) {
      intervalId = setInterval(async () => {
        try {
          const status = await checkTranscriptionStatus(transcriptionUrl);
          setTranscriptionStatus(status);
          if (!['NotStarted', 'Running'].includes(status)) {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Error checking transcription status:', error);
          clearInterval(intervalId);
        }
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transcriptionStatus, transcriptionUrl]);

  const handleSubmit = async event => {
    event.preventDefault();
    if (audioFiles.length === 0) {
      alert('Please upload at least one audio file before transcribing.');
      return;
    }
    setIsSubmitting(true);
    try {
      const url = await uploadAndTranscribe(audioFiles);
      setTranscriptionUrl(url);
      setTranscriptionStatus('NotStarted');
      onTranscriptionCreated(url);
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`An error occurred during transcription: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (transcriptionStatus) {
      case 'NotStarted':
      case 'Running':
        return <RefreshCw className='animate-spin ml-2 text-indigo-600' size={18} />;
      case 'Succeeded':
        return <CheckCircle className='ml-2 text-green-500' size={18} />;
      case 'Failed':
        return <XCircle className='ml-2 text-red-500' size={18} />;
      case 'Cancelling':
      case 'Cancelled':
        return <AlertCircle className='ml-2 text-yellow-500' size={18} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-4 sm:p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl sm:text-2xl font-bold text-indigo-700 mb-4'>Audio Transcription Service</h2>

      <div className='mb-4'>
        <label
          htmlFor='audio-upload'
          className='flex items-center justify-center w-full h-24 sm:h-32 px-4 transition bg-white border-2 border-indigo-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none'>
          <span className='flex items-center space-x-2'>
            <Upload className='w-5 h-5 sm:w-6 sm:h-6 text-indigo-600' />
            <span className='font-medium text-sm sm:text-base text-indigo-600'>
              Drop audio files here or click to upload
            </span>
          </span>
          <input
            id='audio-upload'
            type='file'
            className='hidden'
            onChange={handleFileChange}
            accept='audio/*'
            multiple
            ref={fileInputRef}
          />
        </label>
      </div>

      {audioFiles.length > 0 && (
        <div className='space-y-2 mb-4'>
          {audioFiles.map((file, index) => (
            <div key={index} className='flex items-center justify-between p-2 bg-indigo-100 rounded-md'>
              <span className='text-xs sm:text-sm text-indigo-700 truncate'>{file.name}</span>
              <button
                type='button'
                onClick={() => removeFile(index)}
                className='p-1 text-indigo-600 hover:text-indigo-800 focus:outline-none'
                aria-label='Remove file'>
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type='submit'
        className='w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition'
        disabled={isSubmitting || audioFiles.length === 0}>
        {isSubmitting ? (
          <>
            <Loader className='animate-spin inline-block mr-2' size={18} />
            Transcribing...
          </>
        ) : (
          'Transcribe Audio'
        )}
      </button>

      {transcriptionStatus && (
        <div className='mt-4 p-2 bg-indigo-50 rounded-md'>
          <p className='text-sm text-indigo-700 flex items-center'>
            Transcription Status:
            <span className='font-semibold ml-2'>{transcriptionStatus}</span>
            {getStatusIcon()}
          </p>
        </div>
      )}
    </form>
  );
};

export default MultiAudioUploaderForm;
