import React from 'react';
import { Users, Key, Briefcase, Zap, DollarSign, Heart, Headphones, CreditCard, Building } from 'lucide-react';

const BusinessModelCanvas = () => {
  const sections = [
    {
      title: 'Key Partners',
      icon: <Building className='w-6 h-6' />,
      items: [
        'South African Law Society',
        'Legal Tech Companies',
        'Cloud Service Providers',
        'AI Research Institutions',
      ],
    },
    {
      title: 'Key Activities',
      icon: <Key className='w-6 h-6' />,
      items: ['AI Model Development', 'Platform Maintenance', 'Customer Support', 'Compliance Management'],
    },
    {
      title: 'Value Propositions',
      icon: <Zap className='w-6 h-6' />,
      items: [
        'Time-Saving Transcription',
        'Accurate Legal Summarisation',
        'Multilingual Support',
        'Enhanced Productivity',
      ],
    },
    {
      title: 'Customer Relationships',
      icon: <Heart className='w-6 h-6' />,
      items: ['Self-Service Platform', 'Dedicated Account Managers', 'Community Forums', 'Regular Webinars'],
    },
    {
      title: 'Customer Segments',
      icon: <Users className='w-6 h-6' />,
      items: ['Law Firms', 'Corporate Legal Departments', 'Government Legal Offices', 'Individual Lawyers'],
    },
    {
      title: 'Key Resources',
      icon: <Briefcase className='w-6 h-6' />,
      items: ['AI Technology', 'Legal Expertise', 'Development Team', 'Secure Infrastructure'],
    },
    {
      title: 'Channels',
      icon: <Headphones className='w-6 h-6' />,
      items: ['Web Platform', 'Mobile App', 'API Integrations', 'Direct Sales'],
    },
    {
      title: 'Cost Structure',
      icon: <CreditCard className='w-6 h-6' />,
      items: ['AI Development', 'Infrastructure Costs', 'Marketing & Sales', 'Customer Support'],
    },
    {
      title: 'Revenue Streams',
      icon: <DollarSign className='w-6 h-6' />,
      items: ['Subscription Fees', 'Usage-Based Pricing', 'Enterprise Contracts', 'API Access Fees'],
    },
  ];

  return (
    <div className='bg-white p-6'>
      <h2 className='text-3xl font-bold text-center mb-8 text-indigo-700'>Legal Scriber Business Model Canvas</h2>
      <div className='grid grid-cols-3 gap-4'>
        {sections.map((section, index) => (
          <div key={index} className='bg-indigo-50 p-4 rounded-lg'>
            <h3 className='text-xl font-semibold mb-3 flex items-center text-indigo-600'>
              {section.icon}
              <span className='ml-2'>{section.title}</span>
            </h3>
            <ul className='list-disc list-inside'>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className='text-sm mb-1 text-gray-700'>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessModelCanvas;
