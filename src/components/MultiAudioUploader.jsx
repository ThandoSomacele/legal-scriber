// src/components/MultiAudioUploader.jsx

import React, { useState, useRef } from 'react';
import { Upload, X, Loader, AlertCircle } from 'lucide-react';
import apiClient from '../apiClient';

const MultiAudioUploader = ({ onTranscriptionCreated, meetingType }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
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

  const handleSubmit = async event => {
    event.preventDefault();
    if (audioFiles.length === 0) {
      setError('Please upload at least one audio file before transcribing.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      audioFiles.forEach(file => formData.append('files', file));
      formData.append('meetingType', meetingType);

      const response = await apiClient.post('/api/transcriptions', formData);
      onTranscriptionCreated(response.data.transcriptionId, meetingType);
    } catch (error) {
      console.error('Transcription error:', error);
      setError(`An error occurred during transcription: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-bold text-indigo-700 mb-4'>
        {meetingType === 'legal' ? 'Legal Hearing' : 'Meeting'} Audio Transcription Service
      </h2>

      <div className='mb-4'>
        <label
          htmlFor='audio-upload'
          className='flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-indigo-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none'>
          <span className='flex items-center space-x-2'>
            <Upload className='w-6 h-6 text-indigo-600' />
            <span className='font-medium text-indigo-600'>
              Drop {meetingType === 'legal' ? 'legal hearing' : 'meeting'} audio files here or click to upload
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
              <span className='text-sm text-indigo-700 truncate'>{file.name}</span>
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
        className='w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition'
        disabled={isSubmitting || audioFiles.length === 0}>
        {isSubmitting ? (
          <>
            <Loader className='animate-spin inline-block mr-2' size={18} />
            Transcribing...
          </>
        ) : (
          `Transcribe ${meetingType === 'legal' ? 'Legal Hearing' : 'Meeting'} Audio`
        )}
      </button>

      {error && (
        <div className='mt-4 p-2 bg-red-100 text-red-700 rounded-md'>
          <p className='text-sm flex items-center'>
            <AlertCircle className='mr-2' size={18} />
            {error}
          </p>
        </div>
      )}
    </form>
  );
};

export default MultiAudioUploader;
