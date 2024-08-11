import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

const MultiAudioUploaderForm = () => {
  // State to store the list of uploaded audio files
  const [audioFiles, setAudioFiles] = useState([]);
  // State to manage form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ref for the file input element
  const fileInputRef = useRef(null);

  // Handler for file input changes
  const handleFileChange = event => {
    const files = Array.from(event.target.files);
    // Filter out non-audio files
    const newAudioFiles = files.filter(file => file.type.startsWith('audio/'));
    // Add new audio files to the existing list
    setAudioFiles(prevFiles => [...prevFiles, ...newAudioFiles]);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to remove a file from the list
  const removeFile = index => {
    setAudioFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Placeholder function for Azure batch transcription API
  const transcribeAudio = async files => {
    console.log('Transcribing files:', files);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  // Form submission handler
  const handleSubmit = async event => {
    event.preventDefault();
    if (audioFiles.length === 0) {
      alert('Please upload at least one audio file before transcribing.');
      return;
    }
    setIsSubmitting(true);
    try {
      await transcribeAudio(audioFiles);
      alert('Transcription process initiated successfully!');
      setAudioFiles([]); // Clear the file list after successful submission
    } catch (error) {
      console.error('Transcription error:', error);
      alert('An error occurred during transcription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-4 sm:p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl sm:text-2xl font-bold text-indigo-700 mb-4'>Audio Transcription Service</h2>

      {/* File upload area */}
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

      {/* List of uploaded files */}
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

      {/* Submit button */}
      <button
        type='submit'
        className='w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition'
        disabled={isSubmitting || audioFiles.length === 0}>
        {isSubmitting ? 'Transcribing...' : 'Transcribe Audio'}
      </button>
    </form>
  );
};

export default MultiAudioUploaderForm;
