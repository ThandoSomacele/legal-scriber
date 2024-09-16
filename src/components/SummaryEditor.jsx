import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { Save, Edit, Copy, Loader, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../apiClient';
import MarkdownCheatsheet from './MarkdownCheatsheet';
import '../styles/SummaryEditor.css'; // Import the custom CSS file

const SummaryEditor = ({ summaryId, meetingType }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCheatsheet, setShowCheatsheet] = useState(false);

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
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving summary:', error);
      setError('Failed to save summary. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(
      () => {
        console.log('Summary copied to clipboard');
      },
      err => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const toggleCheatsheet = () => {
    setShowCheatsheet(!showCheatsheet);
  };

  return (
    <div className='bg-white shadow-md rounded-lg p-4 md:p-6'>
      <h2 className='text-2xl font-semibold text-indigo-700 mb-4'>
        {meetingType === 'legal' ? 'Legal Hearing' : 'Meeting'} Summary
      </h2>

      {!summaryId ? (
        <div className='bg-indigo-50 p-4 rounded-md mb-4'>
          <p className='text-indigo-700'>
            Once your transcription is complete, you can generate a summary here. The summary will provide a concise
            overview of the key points from your {meetingType === 'legal' ? 'legal hearing' : 'meeting'}. You'll be able
            to edit, save, and copy the summary as needed.
          </p>
        </div>
      ) : (
        <>
          {/* Summary display or editor */}
          <div className='mb-4'>
            {isEditing ? (
              <MarkdownEditor
                value={summary}
                onChange={handleEditorChange}
                renderHTML={text => <ReactMarkdown className='preview-markdown'>{text}</ReactMarkdown>}
                className='markdown-editor'
              />
            ) : (
              <div className='prose max-w-none preview-markdown'>
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className='flex flex-wrap gap-2 mb-4'>
            <button
              onClick={toggleEditing}
              className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'>
              {isEditing ? (
                <>
                  <Save className='mr-2' size={18} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className='mr-2' size={18} />
                  Edit
                </>
              )}
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'>
                {isSaving ? (
                  <>
                    <Loader className='animate-spin mr-2' size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='mr-2' size={18} />
                    Save
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleCopy}
              className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'>
              <Copy className='mr-2' size={18} />
              Copy
            </button>
          </div>

          {/* Markdown cheatsheet */}
          <MarkdownCheatsheet />
        </>
      )}
    </div>
  );
};

export default SummaryEditor;
