import React from 'react';
import { CheckCircle } from 'lucide-react';

const PricingSection = () => {
  const tiers = [
    {
      name: 'Basic',
      price: 'R499',
      frequency: '/month',
      description: 'Perfect for small legal practices or individual lawyers.',
      features: [
        'Up to 10 hours of audio transcription',
        'Basic legal document summarisation',
        'Email support',
        '30-day data retention',
      ],
      cta: 'Start your free trial',
      mostPopular: false,
    },
    {
      name: 'Professional',
      price: 'R999',
      frequency: '/month',
      description: 'Ideal for medium-sized law firms with higher volume needs.',
      features: [
        'Up to 30 hours of audio transcription',
        'Advanced legal document summarisation',
        'Priority email and chat support',
        '90-day data retention',
        'Custom vocabulary support',
      ],
      cta: 'Start your free trial',
      mostPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      frequency: '',
      description: 'Tailored solutions for large law firms and legal departments.',
      features: [
        'Unlimited audio transcription',
        'Advanced legal document summarisation with custom models',
        '24/7 phone and email support',
        'Unlimited data retention',
        'Custom API integration',
        'Dedicated account manager',
      ],
      cta: 'Contact sales',
      mostPopular: false,
    },
  ];

  return (
    <div className='bg-gray-100 py-12 sm:py-16 lg:py-20' id='pricing'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl'>Pricing Plans</h2>
          <p className='mt-4 text-xl text-gray-600'>Choose the perfect plan for your legal transcription needs</p>
        </div>

        <div className='mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3'>
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-lg shadow-md divide-y divide-gray-200 ${
                tier.mostPopular ? 'border-2 border-indigo-500' : ''
              }`}>
              {tier.mostPopular && (
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <span className='inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold tracking-wider uppercase text-white'>
                    Most popular
                  </span>
                </div>
              )}
              <div className='p-6'>
                <h2 className='text-2xl font-semibold text-gray-900'>{tier.name}</h2>
                <p className='mt-4 text-sm text-gray-500'>{tier.description}</p>
                <p className='mt-8'>
                  <span className='text-4xl font-extrabold text-gray-900'>{tier.price}</span>
                  <span className='text-base font-medium text-gray-500'>{tier.frequency}</span>
                </p>
                <a
                  href='#'
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    tier.mostPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}>
                  {tier.cta}
                </a>
              </div>
              <div className='pt-6 pb-8 px-6'>
                <h3 className='text-xs font-medium text-gray-900 tracking-wide uppercase'>What's included</h3>
                <ul role='list' className='mt-6 space-y-4'>
                  {tier.features.map(feature => (
                    <li key={feature} className='flex space-x-3'>
                      <CheckCircle className='flex-shrink-0 h-5 w-5 text-green-500' aria-hidden='true' />
                      <span className='text-sm text-gray-500'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
