// src/components/layouts/MainLayout.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SidebarNav from '../SidebarNav';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Determine if we should show the footer based on auth status and route
  const showFooter = !user || isHomePage;

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      <div className='flex'>
        {user && !isHomePage && <SidebarNav />}
        <main className={`flex-1 ${user && !isHomePage ? 'md:ml-64' : ''} mt-20 mb-16 md:mb-0`}>{children}</main>
      </div>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
