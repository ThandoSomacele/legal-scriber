import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import apiClient from '../apiClient.js';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/api/user/profile');
        setUserData(response.data);
      } catch (error) {
        setError(`Failed to fetch user data: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='max-w-md mx-auto mt-10'>
      <h2 className='text-2xl font-bold text-indigo-700 mb-6'>User Profile</h2>
      {userData && (
        <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>Personal Information</h3>
          </div>
          <div className='border-t border-gray-200'>
            <dl>
              <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 flex items-center'>
                  <User className='mr-2 h-5 w-5' /> Name
                </dt>
                <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>{userData.name}</dd>
              </div>
              <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 flex items-center'>
                  <Mail className='mr-2 h-5 w-5' /> Email address
                </dt>
                <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>{userData.email}</dd>
              </div>
              {/* Add more user details as needed */}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
