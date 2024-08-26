import React from 'react';
import { CheckCircle, Users, TrendingUp, Award } from 'lucide-react';

const TractionMilestonesSlide = () => {
  return (
    <div className='bg-white text-indigo-900 p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Traction &amp; Milestones in South Africa</h2>
      <div className='space-y-8'>
        <div className='flex items-center'>
          <CheckCircle className='w-12 h-12 mr-6 text-green-500 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-2'>Successful Launch</h3>
            <p className='text-xl'>Successfully launched beta version in Johannesburg and Cape Town in Q2 2024</p>
          </div>
        </div>
        <div className='flex items-center'>
          <Users className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-2'>Rapid User Adoption</h3>
            <p className='text-xl'>300+ active users from top South African law firms within first 3 months</p>
          </div>
        </div>
        <div className='flex items-center'>
          <TrendingUp className='w-12 h-12 mr-6 text-indigo-600 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-2'>Revenue Milestone</h3>
            <p className='text-xl'>Achieved R1M Monthly Recurring Revenue by Q4 2024</p>
          </div>
        </div>
        <div className='flex items-center'>
          <Award className='w-12 h-12 mr-6 text-yellow-500 flex-shrink-0' />
          <div>
            <h3 className='text-2xl font-semibold mb-2'>Industry Recognition</h3>
            <p className='text-xl'>
              Winner of 'Most Innovative Legal Tech Solution 2024' at the South African Law Awards
            </p>
          </div>
        </div>
      </div>
      <div className='mt-12 bg-indigo-100 p-6 rounded-lg'>
        <p className='text-2xl text-center font-semibold'>
          Legal Scriber is gaining significant momentum and recognition in the South African legal tech industry
        </p>
      </div>
    </div>
  );
};

export default TractionMilestonesSlide;
