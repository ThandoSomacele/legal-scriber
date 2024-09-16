import React from 'react';

export default function HeroSection() {
  return (
    <div className='relative'>
      <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gray-100'></div>
      <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
        <div className='relative shadow-xl sm:rounded-2xl sm:overflow-hidden'>
          <div className='absolute inset-0'>
            <img
              className='h-full w-full object-cover'
              src='/src/assets/images/home/pexels-divinetechygirl-1181555.webp'
              alt='A women working on a laptop'
            />
            <div className='absolute inset-0 bg-indigo-700 mix-blend-multiply'></div>
          </div>
          <div className='relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8'>
            <h1 className='text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl'>
              <span className='block text-white'>Transform Legal Audio</span>
              <span className='block text-indigo-200'>into Actionable Text</span>
            </h1>
            <p className='mt-6 max-w-lg mx-auto text-center text-xl text-indigo-200 sm:max-w-3xl'>
              Legal Scriber leverages cutting-edge AI to transcribe and summarise legal audio recordings, streamlining
              your workflow and enhancing productivity.
            </p>
            <div className='mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center'>
              <div className='space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5'>
                <a
                  href='/transcribe'
                  className='flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8'>
                  Get started
                </a>
                <a
                  href='#'
                  className='flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8'>
                  Live demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
