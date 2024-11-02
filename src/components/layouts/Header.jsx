import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Navigation items for logged out users (marketing)
  const marketingNavItems = [
    { type: 'home-section', name: 'Features', href: 'features' },
    { type: 'home-section', name: 'Pricing', href: 'pricing' },
    { type: 'home-section', name: 'About Us', href: 'about' },
    { type: 'home-section', name: 'Contact', href: 'contact' },
  ];

  // Navigation items for logged in users
  const userNavItems = [
    // { name: 'Dashboard', href: '/dashboard' },
    // { name: 'Transcriptions', href: '/transcriptions' },
    // { name: 'Summaries', href: '/summaries' },
    { name: 'Transcribe', href: '/transcribe' },
  ];

  // Determine which nav items to use based on login state
  const navItems = user ? userNavItems : marketingNavItems;

  const navigate = useNavigate();

  // Function to scroll to a specific element by ID
  const scrollToElement = id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  // Common link style
  const linkStyle = 'text-base font-medium text-gray-500 hover:text-gray-900';

  // Render the appropriate link based on whether it's a home-section on the home page or a separate page
  const renderNavLink = (item, i) => {
    return (
      <RouterLink
        key={i}
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
    <header className='bg-white shadow-md fixed top-0 left-0 right-0 z-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4 md:justify-start md:space-x-10'>
          {/* Logo */}
          <div className='flex justify-start lg:w-0 lg:flex-1'>
            <RouterLink to='/' className='text-indigo-600 text-xl font-bold'>
              Legal Scriber
            </RouterLink>
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
          <nav className='hidden md:flex space-x-10'>{navItems.map(renderNavLink)}</nav>

          {/* User actions */}
          <div className='hidden md:flex items-center justify-end md:flex-1 lg:w-0'>
            {user ? (
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className='flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  <User className='h-8 w-8 text-indigo-600 mr-2' />
                  <span>{user.name}</span>
                  <ChevronDown className='ml-2 h-5 w-5' aria-hidden='true' />
                </button>
                {isUserMenuOpen && (
                  <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
                    <RouterLink to='/profile' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                      Your Profile
                    </RouterLink>
                    <RouterLink
                      to='/subscription/usage'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                      Usage Dashboard
                    </RouterLink>
                    <RouterLink
                      to='/subscription/change'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                      Manage Subscription
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
                )}
              </div>
            ) : (
              <>
                <RouterLink
                  to='/login'
                  className='whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900'>
                  Log in
                </RouterLink>
                <RouterLink
                  to='/signup'
                  className='ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                  Sign up
                </RouterLink>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
          {navItems.map(item => (
            <div
              key={item.name}
              className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
              {renderNavLink(item)}
            </div>
          ))}
        </div>
        <div className='pt-4 pb-3 border-t border-gray-200'>
          <div className='px-2 space-y-1'>
            {user ? (
              <>
                <RouterLink
                  to='/profile'
                  className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  Your Profile
                </RouterLink>
                <RouterLink
                  to='/billing'
                  className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  Billing
                </RouterLink>
                <RouterLink
                  to='/settings'
                  className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  Settings
                </RouterLink>
                <button
                  onClick={handleSignOut}
                  className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <RouterLink
                  to='/login'
                  className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  Log in
                </RouterLink>
                <RouterLink
                  to='/signup'
                  className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                  Sign up
                </RouterLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
