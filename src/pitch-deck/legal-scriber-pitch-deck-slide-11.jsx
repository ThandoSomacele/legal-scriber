import React from 'react';
import { Map, Flag, Target, Rocket } from 'lucide-react';

const RoadmapSlide = () => {
  return (
    <div className='bg-indigo-100 text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Roadmap for South African Expansion</h2>
      <div className='space-y-8'>
        <div className='flex items-start'>
          <Flag className='w-12 h-12 mr-6 text-green-500 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Q4 2024: National Expansion</h3>
            <p className='text-xl'>Launch in all major South African cities, including Durban and Pretoria</p>
          </div>
        </div>
        <div className='flex items-start'>
          <Map className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Q2 2025: Enhanced Multilingual Support</h3>
            <p className='text-xl'>Introduce support for all 11 official South African languages</p>
          </div>
        </div>
        <div className='flex items-start'>
          <Target className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Q4 2025: Government Partnerships</h3>
            <p className='text-xl'>
              Collaborate with South African Department of Justice for court transcription services
            </p>
          </div>
        </div>
        <div className='flex items-start'>
          <Rocket className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>2026: African Expansion</h3>
            <p className='text-xl'>Enter key African markets including Nigeria, Kenya, and Ghana</p>
          </div>
        </div>
      </div>
      <div className='mt-12 bg-white p-6 rounded-lg'>
        <p className='text-2xl text-center font-semibold'>
          Legal Scriber is committed to continuous innovation and growth across South Africa and beyond
        </p>
      </div>
    </div>
  );
};

export default RoadmapSlide;
