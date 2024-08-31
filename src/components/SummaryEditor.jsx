import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { Save, Copy, Check, ChevronDown } from 'lucide-react';
import './../styles/SummaryEditor.css';
import MarkdownCheatsheet from './MarkdownCheatsheet';

const SummaryEditor = ({ initialSummary, onSave, summaryType }) => {
  const getLegalPlaceholder = () => `# Awaiting Legal Transcription Summary

Your comprehensive legal summary will be displayed here once the transcription and analysis are complete.

## What to Expect:

- **Key Legal Points**: A concise overview of the main legal issues discussed.
- **Arguments**: Summary of arguments presented by all parties involved.
- **Decisions**: Any rulings or decisions made during the proceedings.
- **Legal Terminology**: Explanations of relevant legal terms used.
- **Context**: Maintenance of the original context and nuances of the case.

*Please note: This AI-generated summary is intended for informational purposes only and should not be considered as legal advice.*`;

  const getMeetingPlaceholder = () => `# Awaiting Meeting Minutes Summary

Your comprehensive meeting minutes summary will be displayed here once the transcription and analysis are complete.

## What to Expect:

- **Meeting Overview**: Date, time, attendees, and purpose of the meeting.
- **Agenda Items**: Main topics discussed during the meeting.
- **Key Points**: Important points raised for each agenda item.
- **Decisions Made**: Outcomes and resolutions from the meeting.
- **Action Items**: Tasks assigned, responsible persons, and deadlines.
- **Next Steps**: Follow-up actions and future meeting plans.

*Please note: This AI-generated summary is intended to capture the essence of the meeting and may not include every detail discussed.*`;

  const placeholderSummary = summaryType === 'legal' ? getLegalPlaceholder() : getMeetingPlaceholder();

  const [summary, setSummary] = useState(initialSummary || placeholderSummary);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    if (initialSummary) {
      setSummary(initialSummary);
    }
  }, [initialSummary]);

  useEffect(() => {
    const checkScroll = () => {
      if (summaryRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = summaryRef.current;
        setCanScroll(scrollHeight > clientHeight);
        setHasScrolled(scrollTop > 0);
      }
    };

    const handleScroll = () => {
      checkScroll();
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);

    if (summaryRef.current) {
      summaryRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', checkScroll);
      if (summaryRef.current) {
        summaryRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [summary]);

  const handleEditorChange = ({ text }) => {
    setSummary(text);
  };

  const handleSave = useCallback(() => {
    onSave(summary);
    setIsEditing(false);
  }, [summary, onSave]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getLegalDisclaimer = () => `
_Disclaimer: This summary is generated based on AI analysis and may not capture all nuances of the legal case. It is intended for informational purposes only and should not be considered as legal advice. Please consult with a qualified legal professional for accurate interpretation and application of the law._
  `;

  const getMeetingDisclaimer = () => `
_Disclaimer: This summary is generated based on AI analysis of the meeting transcription. While it aims to capture the key points and decisions, it may not include every detail discussed. Please refer to the full transcription or consult with meeting participants for complete information._
  `;

  const disclaimer = summaryType === 'legal' ? getLegalDisclaimer() : getMeetingDisclaimer();

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold text-indigo-700'>
          {summaryType === 'legal' ? 'Legal Hearing Summary' : 'Meeting Minutes Summary'}
        </h2>
        <div className='flex space-x-2'>
          <button
            onClick={handleCopy}
            className='bg-indigo-100 text-indigo-700 py-1 px-3 rounded-md hover:bg-indigo-200 transition-colors duration-300 flex items-center'>
            {isCopied ? <Check className='mr-1' size={16} /> : <Copy className='mr-1' size={16} />}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          {isEditing ? (
            <button
              onClick={handleSave}
              className='bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center'>
              <Save className='mr-2' size={16} />
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className='bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-300'>
              Edit
            </button>
          )}
        </div>
      </div>

      <div className='mb-4 relative'>
        {isEditing ? (
          <MarkdownEditor
            value={summary}
            onChange={handleEditorChange}
            className='h-[calc(100vh-200px)] markdown-editor'
            renderHTML={text => <ReactMarkdown className='preview-markdown'>{text}</ReactMarkdown>}
            view={{ menu: true, md: true, html: true }}
          />
        ) : (
          <div
            ref={summaryRef}
            className='bg-indigo-50 p-4 rounded-md markdown-content overflow-y-auto h-[calc(100vh-200px)] relative'>
            <ReactMarkdown className='preview-markdown'>{summary}</ReactMarkdown>
            {canScroll && !hasScrolled && (
              <div className='absolute bottom-0 left-0 right-0 flex justify-center items-center pointer-events-none'>
                <div className='bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-bounce'>
                  <ChevronDown size={20} />
                  <span className='text-sm font-medium'>Scroll for more</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='mt-4 text-sm text-gray-600 border-t pt-4'>
        <ReactMarkdown className='preview-markdown'>{disclaimer}</ReactMarkdown>
      </div>

      <div className='mt-4'>
        <MarkdownCheatsheet />
      </div>
    </div>
  );
};

export default SummaryEditor;
