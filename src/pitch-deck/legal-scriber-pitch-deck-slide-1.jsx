// eslint-disable-next-line no-unused-vars
import React from 'react';
import { FileText, Zap, Scale } from 'lucide-react';

const TitleSlide = () => {
  return (
    <div className='bg-gradient-to-br from-indigo-600 to-indigo-900 text-white p-8 shadow-lg flex flex-col justify-center items-center w-full h-[90vh]'>
      <div className='flex items-center justify-center mb-6'>
        <FileText className='w-16 h-16 mr-4' />
        <Zap className='w-16 h-16 mr-4' />
        <Scale className='w-16 h-16' />
      </div>
      <h1 className='text-5xl font-bold text-center mb-4'>Legal Scriber</h1>
      <p className='text-2xl text-center mb-8'>Revolutionising Legal Documentation in South Africa with AI</p>
      <div className='text-center'>
        <span className='inline-block bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold text-xl'>
          Pitch Deck
        </span>
      </div>
    </div>
  );
};

export default TitleSlide;
