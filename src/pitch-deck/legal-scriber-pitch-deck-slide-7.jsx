import React from 'react';
import { DollarSign, Users, Briefcase, BarChart } from 'lucide-react';

const BusinessModelSlide = () => {
  return (
    <div className='bg-indigo-100 text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Business Model for South African Market</h2>
      <div className='grid grid-cols-2 gap-8'>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <DollarSign className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Subscription Model</h3>
          <p className='text-xl text-center'>
            Tiered pricing plans for firms of all sizes, tailored to South African market rates
          </p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <Users className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Enterprise Solutions</h3>
          <p className='text-xl text-center'>
            Customised packages for large South African law firms and legal departments
          </p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <Briefcase className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>API Integration</h3>
          <p className='text-xl text-center'>For South African legal tech companies and government institutions</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow flex flex-col items-center'>
          <BarChart className='w-16 h-16 mb-6 text-indigo-600' />
          <h3 className='text-2xl font-semibold mb-4'>Usage-Based Pricing</h3>
          <p className='text-xl text-center'>
            Pay-per-use options for occasional users and smaller practices in South Africa
          </p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        Multiple revenue streams ensure sustainable growth and cater to diverse needs of the South African legal sector.
      </p>
    </div>
  );
};

export default BusinessModelSlide;
