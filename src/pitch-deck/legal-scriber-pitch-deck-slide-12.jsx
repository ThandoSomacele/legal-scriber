import React from 'react';
import { ArrowRight, Mail, Phone, Linkedin } from 'lucide-react';

const CallToActionSlide = () => {
  return (
    <div className='bg-indigo-700 text-white p-8 shadow-lg flex flex-col justify-center w-full'>
      <h2 className='text-4xl font-bold text-center mb-8'>Join Us in Revolutionising South African Legal Tech</h2>
      <div className='text-center mb-12'>
        <p className='text-2xl mb-6'>
          Legal Scriber is poised to transform the South African legal industry. We invite you to be part of this
          exciting journey.
        </p>
        <button className='bg-white text-indigo-700 font-bold py-3 px-6 rounded-full inline-flex items-center text-xl hover:bg-indigo-100 transition duration-300'>
          Invest Now
          <ArrowRight className='ml-2' size={24} />
        </button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='flex flex-col items-center'>
          <Mail className='w-12 h-12 mb-4' />
          <p className='text-xl'>invest@legalscriber.co.za</p>
        </div>
        <div className='flex flex-col items-center'>
          <Phone className='w-12 h-12 mb-4' />
          <p className='text-xl'>+27 (0) 11 123 4567</p>
        </div>
        <div className='flex flex-col items-center'>
          <Linkedin className='w-12 h-12 mb-4' />
          <p className='text-xl'>linkedin.com/company/legalscriber-sa</p>
        </div>
      </div>
      <p className='text-2xl text-center mt-12 font-semibold'>
        Let's shape the future of legal documentation in South Africa together!
      </p>
    </div>
  );
};

export default CallToActionSlide;
