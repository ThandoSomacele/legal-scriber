import React, { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items
  const navItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About Us', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
    { name: 'Transcribe', href: '/transcribe' },
  ];

  return (
    <header className='bg-white shadow-md mb-7'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4 md:justify-start md:space-x-10'>
          {/* Logo */}
          <div className='flex justify-start lg:w-0 lg:flex-1'>
            <Link to='/' className='text-indigo-600 text-xl font-bold'>
              Legal Scriber
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='-mr-2 -my-2 md:hidden'>
            <button
              type='button'
              className='bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
              onClick={toggleMobileMenu}>
              <span className='sr-only'>Open menu</span>
              {isMobileMenuOpen ? (
                <X className='h-6 w-6' aria-hidden='true' />
              ) : (
                <Menu className='h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className='hidden md:flex space-x-10'>
            {navItems.map(item => (
              <a key={item.name} href={item.href} className='text-base font-medium text-gray-500 hover:text-gray-900'>
                {item.name}
              </a>
            ))}
          </nav>

          {/* User actions */}
          <div className='hidden md:flex items-center justify-end md:flex-1 lg:w-0'>
            {isLoggedIn ? (
              <>
                <User className='h-8 w-8 text-indigo-600 mr-2' />
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className='ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition'>
                  Log out
                </button>
              </>
            ) : (
              <>
                <a
                  href='#'
                  onClick={() => setIsLoggedIn(true)}
                  className='whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900'>
                  Sign in
                </a>
                <a
                  href='#'
                  className='ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition'>
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
          {navItems.map(item => (
            <a
              key={item.name}
              href={item.href}
              className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
              {item.name}
            </a>
          ))}
        </div>
        <div className='pt-4 pb-3 border-t border-gray-200'>
          <div className='px-2 space-y-1'>
            {isLoggedIn ? (
              <button
                onClick={() => setIsLoggedIn(false)}
                className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-800 transition'>
                Log out
              </button>
            ) : (
              <>
                <a
                  href='#'
                  onClick={() => setIsLoggedIn(true)}
                  className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  Sign in
                </a>
                <a
                  href='#'
                  className='block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-800 transition'>
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
