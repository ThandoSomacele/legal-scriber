import React from 'react';
import { DollarSign, TrendingUp, PieChart, Users } from 'lucide-react';

const FinancialsSlide = () => {
  return (
    <div className='bg-white text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Financial Projections for South African Market</h2>
      <div className='grid grid-cols-2 gap-8'>
        <div className='bg-indigo-100 p-6 rounded-lg flex flex-col items-center'>
          <DollarSign className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Revenue</h3>
          <p className='text-xl text-center'>R50M projected by end of Year 3</p>
        </div>
        <div className='bg-indigo-100 p-6 rounded-lg flex flex-col items-center'>
          <TrendingUp className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Growth Rate</h3>
          <p className='text-xl text-center'>100% Year-over-Year for first 3 years</p>
        </div>
        <div className='bg-indigo-100 p-6 rounded-lg flex flex-col items-center'>
          <PieChart className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Profit Margin</h3>
          <p className='text-xl text-center'>30% by Year 3</p>
        </div>
        <div className='bg-indigo-100 p-6 rounded-lg flex flex-col items-center'>
          <Users className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Customer Base</h3>
          <p className='text-xl text-center'>5,000+ South African legal professionals by end of Year 3</p>
        </div>
      </div>
      <div className='mt-12 bg-indigo-600 text-white p-6 rounded-lg'>
        <p className='text-2xl text-center font-semibold'>
          Seeking R20M in Series A funding to accelerate growth and product development in the South African market
        </p>
      </div>
    </div>
  );
};

export default FinancialsSlide;
