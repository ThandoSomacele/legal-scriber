import React from 'react';
import { Users, Scale, Award } from 'lucide-react';
import sharonImg from './../assets/images/founders/sharon-somacele.webp';
import thandoImg from './../assets/images/founders/thando-somacele.webp';

const AboutUsSection = () => {
  const founders = [
    // {
    //   name: 'Sharon',
    //   role: 'Co-founder & Legal Expert',
    //   image: sharonImg,
    //   description:
    //     'With a distinguished degree in Law, Sharon brings a wealth of legal knowledge to Legal Scriber. Her expertise ensures our AI solutions are grounded in solid legal principles.',
    // },
    {
      name: 'Thando Somacele',
      role: 'Co-founder & Tech Innovator',
      image: thandoImg,
      description:
        'A seasoned developer with over a decade of coding experience, Thando holds certifications from Microsoft and Udemy. His technical prowess drives the innovative AI behind Legal Scriber.',
    },
  ];

  return (
    <div className='bg-white py-12 sm:py-16 lg:py-20' id='about'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl'>About Legal Scriber</h2>
          <p className='mt-4 text-xl text-gray-600 max-w-2xl mx-auto'>
            Revolutionising legal documentation through cutting-edge AI technology
          </p>
        </div>

        <div className='mt-16'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto'>
                <Users className='h-6 w-6' aria-hidden='true' />
              </div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>Our Mission</h3>
              <p className='mt-2 text-base text-gray-500'>
                To empower legal professionals with efficient, accurate, and intelligent transcription and summarisation
                tools.
              </p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto'>
                <Scale className='h-6 w-6' aria-hidden='true' />
              </div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>Our Values</h3>
              <p className='mt-2 text-base text-gray-500'>
                Integrity, innovation, and client-centricity drive everything we do at Legal Scriber.
              </p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto'>
                <Award className='h-6 w-6' aria-hidden='true' />
              </div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>Our Expertise</h3>
              <p className='mt-2 text-base text-gray-500'>
                Combining legal knowledge with advanced AI to deliver unparalleled accuracy and insights.
              </p>
            </div>
          </div>
        </div>

        <div className='mt-16'>
          <h3 className='text-2xl font-bold text-gray-900 text-center'>Meet the Founders</h3>
          <p className='mt-4 text-xl text-gray-600 max-w-3xl mx-auto text-center'>
            Our founders bring together the perfect blend of legal expertise and technological innovation to lead Legal
            Scriber into the future of AI-powered legal solutions.
          </p>
          {founders.length > 1 ? (
            <div className='mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2'>
              {founders.map(founder => (
                <div key={founder.name} className='flex flex-col items-center lg:flex-row'>
                  <img className='h-40 w-40 rounded-full xl:w-56 xl:h-56' src={founder.image} alt={founder.name} />
                  <div className='mt-6 lg:mt-0 lg:ml-8 text-center lg:text-left'>
                    <div className='text-lg font-medium text-gray-900'>{founder.name}</div>
                    <div className='text-indigo-600 font-medium'>{founder.role}</div>
                    <p className='mt-2 text-base text-gray-500'>{founder.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            founders.map(founder => (
              <div key={founder.name} className='flex flex-col items-center mt-12'>
                <img className='h-40 w-40 rounded-full xl:w-56 xl:h-56' src={founder.image} alt={founder.name} />
                <div className='mt-6 max-w-3xl mx-auto text-center'>
                  <div className='text-lg font-medium text-gray-900'>{founder.name}</div>
                  <div className='text-indigo-600 font-medium'>{founder.role}</div>
                  <p className='mt-2 text-base  text-gray-500'>{founder.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUsSection;
