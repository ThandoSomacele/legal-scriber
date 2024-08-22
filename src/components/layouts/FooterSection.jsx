import React from 'react';
import { Facebook, Twitter, Instagram, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About Us', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms and Conditions', href: '/terms-and-conditions' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Link, href: 'https://linkedin.com' },
  ];

  return (
    <footer className='bg-indigo-800 text-white'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <div className='xl:grid xl:grid-cols-3 xl:gap-8'>
          <div className='space-y-8 xl:col-span-1'>
            <RouterLink to='/' className='text-2xl font-bold'>
              Legal Scriber
            </RouterLink>
            <p className='text-gray-300 text-base'>
              Revolutionising legal documentation through cutting-edge AI technology.
            </p>
            <div className='flex space-x-6'>
              {socialLinks.map(item => (
                <a key={item.name} href={item.href} className='text-gray-300 hover:text-white'>
                  <span className='sr-only'>{item.name}</span>
                  <item.icon className='h-6 w-6' aria-hidden='true' />
                </a>
              ))}
            </div>
          </div>
          <div className='mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2'>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold text-gray-200 tracking-wider uppercase'>Company</h3>
                <ul role='list' className='mt-4 space-y-4'>
                  {footerLinks.slice(0, 4).map(item => (
                    <li key={item.name}>
                      <RouterLink to={item.href} className='text-base text-gray-300 hover:text-white'>
                        {item.name}
                      </RouterLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='mt-12 md:mt-0'>
                <h3 className='text-sm font-semibold text-gray-200 tracking-wider uppercase'>Legal</h3>
                <ul role='list' className='mt-4 space-y-4'>
                  {footerLinks.slice(4).map(item => (
                    <li key={item.name}>
                      <RouterLink to={item.href} className='text-base text-gray-300 hover:text-white'>
                        {item.name}
                      </RouterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-12 border-t border-indigo-700 pt-8'>
          <p className='text-base text-gray-300 xl:text-center'>
            &copy; {currentYear} Legal Scriber. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
