import React from 'react';
import { TrendingUp, Users, Globe } from 'lucide-react';

const MarketOpportunitySlide = () => {
  return (
    <div className='bg-indigo-700 text-white p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Market Opportunity in South Africa</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <TrendingUp className='w-16 h-16 mb-6' />
          <h3 className='text-2xl font-semibold mb-4'>R7.8 Billion</h3>
          <p className='text-xl text-center'>Estimated South African legal services market size by 2025</p>
        </div>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <Users className='w-16 h-16 mb-6' />
          <h3 className='text-2xl font-semibold mb-4'>27,000+</h3>
          <p className='text-xl text-center'>Practicing attorneys in South Africa</p>
        </div>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <Globe className='w-16 h-16 mb-6' />
          <h3 className='text-2xl font-semibold mb-4'>Regional Hub</h3>
          <p className='text-xl text-center'>South Africa as a gateway to the broader African legal tech market</p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        Legal Scriber is positioned to capture a significant share of the rapidly growing South African legal tech
        market, with potential for expansion across Africa.
      </p>
    </div>
  );
};

export default MarketOpportunitySlide;
