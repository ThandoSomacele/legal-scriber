// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';

const ContactUsSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className='bg-gray-100 py-12 sm:py-16 lg:py-20' id='contact'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl'>Contact Us</h2>
          <p className='mt-4 text-xl text-gray-600'>
            We&apos;d love to hear from you. Get in touch with us for any inquiries.
          </p>
        </div>

        <div className='mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2'>
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                  Name
                </label>
                <input
                  type='text'
                  name='name'
                  id='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 px-4'
                />
              </div>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  id='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 px-4'
                />
              </div>
              <div>
                <label htmlFor='message' className='block text-sm font-medium text-gray-700'>
                  Message
                </label>
                <textarea
                  name='message'
                  id='message'
                  rows='5'
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 px-4 resize-none'></textarea>
              </div>
              <div>
                <button
                  type='submit'
                  className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out'>
                  Send Message
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>Contact Information</h3>
              <p className='mt-1 max-w-2xl text-sm text-gray-500'>Reach out to us through any of these channels.</p>
            </div>
            <div className='border-t border-gray-200'>
              <dl>
                <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-500 flex items-center'>
                    <Mail className='h-5 w-5 mr-2' /> Founder Email
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                    <a href='mailto:thando@legalscriber.co.za'>thando@legalscriber.co.za</a>
                  </dd>
                </div>
                <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-500 flex items-center'>
                    <Phone className='h-5 w-5 mr-2' /> Founder Phone
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                    <a href='tel:27722251491'>+27 722-251-491</a>
                  </dd>
                </div>
                <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-500 flex items-center'>
                    <MapPin className='h-5 w-5 mr-2' /> Address
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>Fourways, Sandton</dd>
                </div>
                <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                  <dt className='text-sm font-medium text-gray-500 flex items-center'>
                    <Mail className='h-5 w-5 mr-2' /> Sales Email
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                    <a href='mailto:sales@legalscriber.co.za'>sales@legalscriber.co.za</a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsSection;
