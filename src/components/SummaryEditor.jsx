// src/components/SummaryEditor.jsx

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { Save, Loader, AlertCircle } from 'lucide-react';
import apiClient from '../apiClient';

const SummaryEditor = ({ summaryId, meetingType }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!summaryId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/summaries/${summaryId}`);
        setSummary(response.data.content);
      } catch (error) {
        console.error('Error fetching summary:', error);
        setError('Failed to fetch summary. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [summaryId]);

  const handleEditorChange = ({ text }) => {
    setSummary(text);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.put(`/api/summaries/${summaryId}`, { content: summary });
      // Optionally, you can show a success message here
    } catch (error) {
      console.error('Error saving summary:', error);
      setError('Failed to save summary. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader className='animate-spin text-indigo-600' size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-red-600 text-center flex items-center justify-center'>
        <AlertCircle className='mr-2' />
        {error}
      </div>
    );
  }

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-semibold text-indigo-700 mb-4'>
        {meetingType === 'legal' ? 'Legal Hearing' : 'Meeting'} Summary
      </h2>
      <MarkdownEditor
        value={summary}
        onChange={handleEditorChange}
        renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
        className='h-96'
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className='mt-4 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
        {isSaving ? (
          <>
            <Loader className='animate-spin mr-2' size={18} />
            Saving...
          </>
        ) : (
          <>
            <Save className='mr-2' size={18} />
            Save Summary
          </>
        )}
      </button>
    </div>
  );
};

export default SummaryEditor;
