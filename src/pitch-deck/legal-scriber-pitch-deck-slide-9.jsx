import React from 'react';
import { Briefcase, Code, ChartBar, Users } from 'lucide-react';

const TeamSlide = () => {
  return (
    <div className='bg-indigo-700 text-white p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-12'>Meet Our South African Team</h2>
      <div className='grid grid-cols-2 gap-8'>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <div className='w-32 h-32 bg-gray-300 rounded-full mb-6'></div>
          <h3 className='text-2xl font-semibold mb-2'>Themba Nkosi</h3>
          <p className='text-lg mb-3'>Co-founder &amp; CEO</p>
          <Briefcase className='w-8 h-8 mb-3' />
          <p className='text-lg text-center'>15+ years in South African legal practice</p>
        </div>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <div className='w-32 h-32 bg-gray-300 rounded-full mb-6'></div>
          <h3 className='text-2xl font-semibold mb-2'>Lerato Moloi</h3>
          <p className='text-lg mb-3'>Co-founder &amp; CTO</p>
          <Code className='w-8 h-8 mb-3' />
          <p className='text-lg text-center'>AI &amp; ML expert, UCT Computer Science graduate</p>
        </div>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <div className='w-32 h-32 bg-gray-300 rounded-full mb-6'></div>
          <h3 className='text-2xl font-semibold mb-2'>Andile Zulu</h3>
          <p className='text-lg mb-3'>Chief Marketing Officer</p>
          <ChartBar className='w-8 h-8 mb-3' />
          <p className='text-lg text-center'>10+ years in tech marketing across Africa</p>
        </div>
        <div className='bg-indigo-600 p-6 rounded-lg flex flex-col items-center'>
          <div className='w-32 h-32 bg-gray-300 rounded-full mb-6'></div>
          <h3 className='text-2xl font-semibold mb-2'>Zanele Mbeki</h3>
          <p className='text-lg mb-3'>Head of Customer Success</p>
          <Users className='w-8 h-8 mb-3' />
          <p className='text-lg text-center'>Expert in South African legal operations</p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        A diverse team with deep expertise in South African law, technology, and business
      </p>
    </div>
  );
};

export default TeamSlide;
