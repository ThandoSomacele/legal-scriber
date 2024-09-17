import React from 'react';
import { Facebook, Twitter, Instagram, Link } from 'lucide-react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const footerLinks = [
    { name: 'Home', href: '/' },
    { type: 'home-section', name: 'Features', href: 'features' },
    { type: 'home-section', name: 'Pricing', href: 'pricing' },
    { type: 'home-section', name: 'About Us', href: 'about' },
    { type: 'home-section', name: 'Contact', href: 'contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms and Conditions', href: '/terms-and-conditions' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Link, href: 'https://linkedin.com' },
  ];

  // Common link style
  const linkStyle = 'text-base text-gray-300 hover:text-white cursor-pointer';

  // Render the appropriate link based on whether it's a section on the home page or a separate page
  const navigate = useNavigate();

  // Function to scroll to a specific element by ID
  const scrollToElement = id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  // Render the appropriate link that always navigates and scrolls to the section on the Home page
  const renderNavLink = item => {
    return (
      <RouterLink
        to={item.type === 'home-section' ? `/#${item.href}` : item.href}
        className={`${linkStyle} cursor-pointer`}
        onClick={e => {
          e.preventDefault();
          if (item.type === 'home-section') {
            // If item is a home-section, navigate to home page with hash
            navigate(`/#${item.href}`);
            // After navigation, scroll to the element (needs a slight delay to ensure DOM is updated)
            setTimeout(() => scrollToElement(item.href), 100);
          } else {
            // Jsut navigate to that route
            navigate(item.href);
          }
        }}>
        {item.name}
      </RouterLink>
    );
  };

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
                    <li key={item.name}>{renderNavLink(item)}</li>
                  ))}
                </ul>
              </div>
              <div className='mt-12 md:mt-0'>
                <h3 className='text-sm font-semibold text-gray-200 tracking-wider uppercase'>Legal</h3>
                <ul role='list' className='mt-4 space-y-4'>
                  {footerLinks.slice(4).map(item => (
                    <li key={item.name}>{renderNavLink(item)}</li>
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

export default Footer;
