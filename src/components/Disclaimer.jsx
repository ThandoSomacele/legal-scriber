import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = ({ type }) => {
  const disclaimerText = {
    transcription:
      'This transcription is generated automatically and may contain errors. Please review and edit as necessary in Summary section below.',
    summary: 'This summary is generated using AI and may not capture all nuances. Please review and adjust as needed.',
  };

  return (
    <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4'>
      <div className='flex items-center'>
        <AlertTriangle className='h-5 w-5 text-yellow-400 mr-2' />
        <p className='text-sm text-yellow-700'>
          <span className='font-medium'>Disclaimer:</span> {disclaimerText[type]}
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
