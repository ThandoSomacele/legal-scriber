import React from 'react';
import { Clock, FileSearch, Banknote, Frown } from 'lucide-react';

const ProblemSlide = () => {
  return (
    <div className='bg-white text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>The Challenge in South African Legal Practice</h2>
      <div className='grid grid-cols-2 gap-12'>
        <div className='flex flex-col items-center'>
          <Clock className='w-20 h-20 mb-6 text-indigo-600' />
          <p className='text-xl text-center'>
            Time-consuming manual transcription, especially for multilingual proceedings
          </p>
        </div>
        <div className='flex flex-col items-center'>
          <FileSearch className='w-20 h-20 mb-6 text-indigo-600' />
          <p className='text-xl text-center'>
            Difficulty in quickly extracting key information from lengthy legal audio in multiple languages
          </p>
        </div>
        <div className='flex flex-col items-center'>
          <Banknote className='w-20 h-20 mb-6 text-indigo-600' />
          <p className='text-xl text-center'>
            High costs associated with traditional transcription services in South Africa
          </p>
        </div>
        <div className='flex flex-col items-center'>
          <Frown className='w-20 h-20 mb-6 text-indigo-600' />
          <p className='text-xl text-center'>
            Increased stress and reduced productivity for South African legal professionals
          </p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        South African legal professionals waste valuable time and resources on administrative tasks, reducing their
        focus on core legal work in a complex, multilingual environment.
      </p>
    </div>
  );
};

export default ProblemSlide;
