import React from 'react';
import { Mic, FileText, Search, BarChart2 } from 'lucide-react';

const ProductFeaturesSlide = () => {
  return (
    <div className='bg-white text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Key Features for South African Legal Professionals</h2>
      <div className='space-y-12'>
        <div className='flex items-start'>
          <Mic className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Advanced Multilingual Speech Recognition</h3>
            <p className='text-xl'>
              Industry-leading accuracy for South African legal terminology and multiple official languages
            </p>
          </div>
        </div>
        <div className='flex items-start'>
          <FileText className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Smart Legal Summarisation</h3>
            <p className='text-xl'>
              AI-driven extraction of key points, arguments, and decisions, tailored to South African law
            </p>
          </div>
        </div>
        <div className='flex items-start'>
          <Search className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Intelligent Search</h3>
            <p className='text-xl'>
              Quickly find relevant information across all your legal documents, with context awareness for South
              African legislation
            </p>
          </div>
        </div>
        <div className='flex items-start'>
          <BarChart2 className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Analytics Dashboard</h3>
            <p className='text-xl'>
              Gain insights into your cases and workflow efficiency, with metrics relevant to South African legal
              practice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFeaturesSlide;
