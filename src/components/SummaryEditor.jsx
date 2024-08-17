import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { Save, Copy, Check } from 'lucide-react';
import './../styles/SummaryEditor.css';
import MarkdownCheatsheet from './MarkdownCheatsheet';

const SummaryEditor = ({ initialSummary, onSave }) => {
  const placeholderSummary = `# Executive Summary: Legal Case Analysis

This document provides a comprehensive overview of the key points discussed in the legal proceedings.

## 1. Case Background

- Plaintiff: John Doe
- Defendant: XYZ Corporation
- Case Type: Employment Discrimination

## 2. Key Arguments

The plaintiff alleges wrongful termination based on the following grounds:

1. **Age Discrimination:** Claims that younger employees were given preferential treatment.
2. **Retaliation:** Argues that termination was a result of filing a complaint with HR.

## 3. Evidence Presented

- Email correspondence between plaintiff and supervisors
- Performance reviews from the last 3 years
- Witness testimonies from co-workers

## 4. Legal Precedents

The case draws parallels to *Smith v. Johnson Corp (2019)*, where the court ruled in favour of the plaintiff under similar circumstances.

## 5. Potential Outcomes

Based on the evidence and legal precedents, potential outcomes include:

- Settlement out of court
- Reinstatement of the plaintiff with back pay
- Monetary compensation for damages

**Note:** This summary is subject to update as the case progresses.`;

  const [summary, setSummary] = useState(initialSummary || placeholderSummary);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  const disclaimer = `
_Disclaimer: This summary is generated based on AI analysis and may not capture all nuances of the legal case. It is intended for informational purposes only and should not be considered as legal advice. Please consult with a qualified legal professional for accurate interpretation and application of the law._
  `;

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold text-indigo-700'>Summary</h2>
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

      <div className='mb-4'>
        {isEditing ? (
          <MarkdownEditor
            value={summary}
            onChange={handleEditorChange}
            className='h-[calc(100vh-300px)] markdown-editor'
            renderHTML={text => <ReactMarkdown className='preview-markdown'>{text}</ReactMarkdown>}
            view={{ menu: true, md: true, html: true }}
          />
        ) : (
          <div className='bg-indigo-50 p-4 rounded-md markdown-content overflow-y-auto h-[calc(100vh-300px)]'>
            <ReactMarkdown className='preview-markdown'>{summary}</ReactMarkdown>
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
