import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './../styles/SummaryEditor.css';
import { Save } from 'lucide-react';

const SummaryEditor = ({ initialSummary }) => {
  const placeholderSummary = `
    <h1>Executive Summary: Legal Case Analysis</h1>
    <p>This document provides a comprehensive overview of the key points discussed in the legal proceedings.</p>
    
    <h2>1. Case Background</h2>
    <ul>
      <li>Plaintiff: John Doe</li>
      <li>Defendant: XYZ Corporation</li>
      <li>Case Type: Employment Discrimination</li>
    </ul>
    
    <h2>2. Key Arguments</h2>
    <p>The plaintiff alleges wrongful termination based on the following grounds:</p>
    <ol>
      <li><strong>Age Discrimination:</strong> Claims that younger employees were given preferential treatment.</li>
      <li><strong>Retaliation:</strong> Argues that termination was a result of filing a complaint with HR.</li>
    </ol>
    
    <h2>3. Evidence Presented</h2>
    <ul>
      <li>Email correspondence between plaintiff and supervisors</li>
      <li>Performance reviews from the last 3 years</li>
      <li>Witness testimonies from co-workers</li>
    </ul>
    
    <h2>4. Legal Precedents</h2>
    <p>The case draws parallels to <em>Smith v. Johnson Corp (2019)</em>, where the court ruled in favor of the plaintiff under similar circumstances.</p>
    
    <h2>5. Potential Outcomes</h2>
    <p>Based on the evidence and legal precedents, potential outcomes include:</p>
    <ul>
      <li>Settlement out of court</li>
      <li>Reinstatement of the plaintiff with back pay</li>
      <li>Monetary compensation for damages</li>
    </ul>
    
    <p><strong>Note:</strong> This summary is subject to update as the case progresses.</p>
  `;

  const [summary, setSummary] = useState(initialSummary || placeholderSummary);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    console.log('Saving summary:', summary);
    setIsEditing(false);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
    ],
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link'];

  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-semibold text-primary-700 mb-4 flex items-center justify-between'>
        Summary
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className='text-sm bg-primary-600 text-white py-1 px-3 rounded-md hover:bg-primary-700 transition-colors duration-300'>
            Edit
          </button>
        )}
      </h2>

      {isEditing ? (
        <div>
          <ReactQuill
            theme='snow'
            modules={modules}
            formats={formats}
            value={summary}
            onChange={setSummary}
            className='bg-secondary-50 rounded-md mb-4'
          />
          <button
            onClick={handleSave}
            className='bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors duration-300 flex items-center justify-center'>
            <Save className='mr-2' size={18} />
            Save Changes
          </button>
        </div>
      ) : (
        <div className='bg-secondary-50 p-4 rounded-md mb-4 ql-editor' dangerouslySetInnerHTML={{ __html: summary }} />
      )}
    </div>
  );
};

export default SummaryEditor;
