import React from 'react';
import { CheckCircle, Award, Zap, Shield } from 'lucide-react';

const CompetitiveAdvantageSlide = () => {
  return (
    <div className='bg-white text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Our Competitive Edge in South Africa</h2>
      <div className='grid grid-cols-2 gap-8'>
        <div className='flex flex-col items-center'>
          <CheckCircle className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>99.5% Accuracy</h3>
          <p className='text-xl text-center'>
            Industry-leading transcription and summarisation precision for South African legal terminology and multiple
            official languages
          </p>
        </div>
        <div className='flex flex-col items-center'>
          <Award className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Local Legal Expertise</h3>
          <p className='text-xl text-center'>AI models trained on vast South African legal datasets and precedents</p>
        </div>
        <div className='flex flex-col items-center'>
          <Zap className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Efficiency</h3>
          <p className='text-xl text-center'>
            5x faster processing than traditional methods, saving valuable time for South African legal professionals
          </p>
        </div>
        <div className='flex flex-col items-center'>
          <Shield className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Compliance Focused</h3>
          <p className='text-xl text-center'>
            Fully compliant with POPIA and other relevant South African data protection laws
          </p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        Legal Scriber combines cutting-edge AI with deep understanding of South African legal landscape for unparalleled
        results.
      </p>
    </div>
  );
};

export default CompetitiveAdvantageSlide;
