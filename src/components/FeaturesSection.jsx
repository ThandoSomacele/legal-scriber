import React from 'react';
import { Mic, FileText, Zap, Lock } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      name: 'Speech-to-Text Transcription',
      description: 'Accurately convert audio recordings into written text using advanced AI technology.',
      icon: Mic,
    },
    {
      name: 'Legal Document Summarisation',
      description: 'Generate concise summaries of complex legal documents, saving time and improving comprehension.',
      icon: FileText,
    },
    {
      name: 'Fast Processing',
      description: 'Quick turnaround times for transcriptions and summaries, enabling efficient workflow.',
      icon: Zap,
    },
    {
      name: 'Secure and Confidential',
      description: 'Bank-level encryption and strict privacy measures to protect sensitive legal information.',
      icon: Lock,
    },
  ];

  return (
    <div className='py-12 bg-white' id='features'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='lg:text-center'>
          <h2 className='text-base text-indigo-600 font-semibold tracking-wide uppercase'>Features</h2>
          <p className='mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
            A better way to handle legal audio
          </p>
          <p className='mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto'>
            Legal Scriber offers a suite of powerful features designed to streamline your legal documentation process.
          </p>
        </div>

        <div className='mt-10'>
          <dl className='space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10'>
            {features.map(feature => (
              <div key={feature.name} className='relative'>
                <dt>
                  <div className='absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white'>
                    <feature.icon className='h-6 w-6' aria-hidden='true' />
                  </div>
                  <p className='ml-16 text-lg leading-6 font-medium text-gray-900'>{feature.name}</p>
                </dt>
                <dd className='mt-2 ml-16 text-base text-gray-500'>{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
