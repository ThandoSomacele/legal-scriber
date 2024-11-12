// src/components/layouts/SidebarNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, FileText, Settings, User, LogOut, BarChart3, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Navigation item component for consistent styling
const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
      ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
    <Icon className='h-5 w-5' />
    <span className='hidden md:block'>{label}</span>
  </Link>
);

const SidebarNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { user } = useAuth();

  // Navigation items configuration
  const navItems = [
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/transcribe', icon: Mic, label: 'Transcribe' },
    { to: '/subscription/usage', icon: BarChart3, label: 'Usage' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Add admin dashboard link for admin users
  if (user?.role === 'admin') {
    navItems.unshift({ to: '/admin/dashboard', icon: HomeIcon, label: 'Admin' });
  }

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className='hidden md:flex fixed left-0 top-20 h-full w-64 bg-white border-r border-gray-200'>
      <div className='flex flex-col w-full p-4 space-y-2'>
        {navItems.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
          />
        ))}
        <button
          onClick={logout}
          className='flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200'>
          <LogOut className='h-5 w-5' />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Mobile bottom navigation
  const MobileNav = () => (
    <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50'>
      <div className='flex justify-around items-center px-4 py-2'>
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center p-2 rounded-lg
              ${location.pathname === item.to ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
            <item.icon className='h-6 w-6' />
            <span className='text-xs mt-1'>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
};

export default SidebarNav;
