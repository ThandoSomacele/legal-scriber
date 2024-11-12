// src/components/layouts/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, ChevronDown, Mic } from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = event => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const marketingNavItems = [
    { type: 'home-section', name: 'Features', href: 'features' },
    { type: 'home-section', name: 'Pricing', href: 'pricing' },
    { type: 'home-section', name: 'About Us', href: 'about' },
    { type: 'home-section', name: 'Contact', href: 'contact' },
  ];

  const scrollToElement = id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  const renderNavLink = (item, i) => {
    return (
      <RouterLink
        key={i}
        to={item.type === 'home-section' ? `/#${item.href}` : item.href}
        className='text-base font-medium text-gray-500 hover:text-gray-900 cursor-pointer'
        onClick={e => {
          e.preventDefault();
          if (item.type === 'home-section') {
            navigate(`/#${item.href}`);
            setTimeout(() => scrollToElement(item.href), 100);
          } else {
            navigate(item.href);
          }
        }}>
        {item.name}
      </RouterLink>
    );
  };

  return (
    <header className='bg-white shadow-md fixed top-0 left-0 right-0 z-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          {/* Logo */}
          <div className='flex justify-start flex-1'>
            <RouterLink to='/' className='text-indigo-600 text-xl font-bold'>
              Legal Scriber
            </RouterLink>
          </div>

          {/* Desktop Navigation (Large screens only) */}
          <nav className='hidden lg:flex space-x-10 flex-1 justify-center'>{marketingNavItems.map(renderNavLink)}</nav>

          {/* Desktop User Actions (Large screens only) */}
          <div className='hidden lg:flex items-center justify-end flex-1 space-x-4'>
            {user ? (
              <>
                <RouterLink
                  to='/transcribe'
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>
                  <Mic className='h-4 w-4 mr-2' />
                  Transcribe
                </RouterLink>

                <div className='relative' ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className='flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none'>
                    <User className='h-8 w-8 text-indigo-600 mr-2' />
                    <span>{user.name}</span>
                    <ChevronDown className='ml-2 h-5 w-5' aria-hidden='true' />
                  </button>

                  {isUserMenuOpen && (
                    <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
                      <div className='py-1'>
                        <RouterLink to='/profile' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                          Your Profile
                        </RouterLink>
                        <RouterLink to='/settings' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                          Settings
                        </RouterLink>
                        {user.role === 'admin' && (
                          <RouterLink
                            to='/admin/dashboard'
                            className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                            Admin Dashboard
                          </RouterLink>
                        )}
                        <button
                          onClick={handleSignOut}
                          className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <RouterLink to='/login' className='text-base font-medium text-gray-500 hover:text-gray-900'>
                  Log in
                </RouterLink>
                <RouterLink
                  to='/signup'
                  className='inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                  Sign up
                </RouterLink>
              </>
            )}
          </div>

          {/* Mobile/Tablet Menu Button (Up to large screens) */}
          <div className='flex lg:hidden'>
            <button
              type='button'
              className='bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className='sr-only'>Open menu</span>
              {isMobileMenuOpen ? (
                <X className='h-6 w-6' aria-hidden='true' />
              ) : (
                <Menu className='h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu (Up to large screens) */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-white border-t border-gray-200`}>
        <div className='px-4 pt-2 pb-3 space-y-2'>
          {/* Navigation Links */}
          {marketingNavItems.map(item => (
            <div
              key={item.name}
              className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
              {renderNavLink(item)}
            </div>
          ))}

          {/* User Actions */}
          {user ? (
            <>
              <RouterLink
                to='/transcribe'
                className='block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                <Mic className='h-4 w-4 mr-2 inline-block' />
                Transcribe
              </RouterLink>
              <RouterLink
                to='/profile'
                className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100'>
                Your Profile
              </RouterLink>
              <RouterLink
                to='/settings'
                className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100'>
                Settings
              </RouterLink>
              {user.role === 'admin' && (
                <RouterLink
                  to='/admin/dashboard'
                  className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100'>
                  Admin Dashboard
                </RouterLink>
              )}
              <button
                onClick={handleSignOut}
                className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50'>
                Sign out
              </button>
            </>
          ) : (
            <>
              <RouterLink
                to='/login'
                className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100'>
                Log in
              </RouterLink>
              <RouterLink
                to='/signup'
                className='block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                Sign up
              </RouterLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
