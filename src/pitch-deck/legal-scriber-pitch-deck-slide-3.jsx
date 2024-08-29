// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Zap, Brain, Lock, Globe } from 'lucide-react';

const SolutionSlide = () => {
  return (
    <div className='bg-indigo-100 text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Our Solution for South Africa</h2>
      <div className='grid grid-cols-2 gap-8'>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <Zap className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>AI-Powered Multilingual Transcription</h3>
          <p className='text-xl text-center'>
            Quickly convert legal audio to accurate text in multiple South African languages
          </p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <Brain className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Intelligent Legal Summarisation</h3>
          <p className='text-xl text-center'>
            Automatically extract key points and insights, understanding South African legal context
          </p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <Lock className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Secure and Compliant</h3>
          <p className='text-xl text-center'>
            Bank-level encryption and compliance with South African data protection laws
          </p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <Globe className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Localised for South Africa</h3>
          <p className='text-xl text-center'>
            Tailored to South African legal terminology and multilingual requirements
          </p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        Legal Scriber: Empowering South African legal professionals to focus on what matters most
      </p>
    </div>
  );
};

export default SolutionSlide;
