// src/components/UserProfile.jsx

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Save, Lock } from 'lucide-react';

const UserProfile = () => {
  // Mock user data - in a real application, this would come from an API or state management system
  const [userData, setUserData] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+27 123 456 7890',
    address: 'Cape Town, South Africa',
    company: 'Legal Eagle LLP',
    joinDate: 'January 2023',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Function to handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setEditedData(prevData => ({ ...prevData, [name]: value }));
  };

  // Function to handle password input changes
  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({ ...prevData, [name]: value }));
  };

  // Function to validate password
  const validatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Function to handle form submission
  const handleSubmit = e => {
    e.preventDefault();
    setUserData(editedData);
    setIsEditing(false);
    // Here you would typically send the updated data to your backend

    if (passwordData.newPassword) {
      if (validatePassword()) {
        // Here you would send the new password to your backend
        console.log('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    }
  };

  return (
    <div className='max-w-4xl mx-auto mt-10 mb-12 lg:mb-20 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-3xl font-bold text-indigo-800 mb-6'>Your Profile</h1>
      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-semibold text-indigo-700'>Personal Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className='flex items-center text-indigo-600 hover:text-indigo-800'>
                <Edit className='w-5 h-5 mr-1' />
                Edit Profile
              </button>
            ) : (
              <button onClick={handleSubmit} className='flex items-center text-green-600 hover:text-green-800'>
                <Save className='w-5 h-5 mr-1' />
                Save Changes
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Name Field */}
              <div className='flex items-center space-x-3'>
                <User className='w-5 h-5 text-indigo-500' />
                {isEditing ? (
                  <input
                    type='text'
                    name='name'
                    value={editedData.name}
                    onChange={handleInputChange}
                    className='flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                ) : (
                  <p>{userData.name}</p>
                )}
              </div>

              {/* Email Field (Username) */}
              <div className='flex items-center space-x-3'>
                <Mail className='w-5 h-5 text-indigo-500' />
                <div className='flex-grow'>
                  <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                    Email (Username)
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={editedData.email}
                    onChange={handleInputChange}
                    className='mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className='flex items-center space-x-3'>
                <Phone className='w-5 h-5 text-indigo-500' />
                {isEditing ? (
                  <input
                    type='tel'
                    name='phone'
                    value={editedData.phone}
                    onChange={handleInputChange}
                    className='flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                ) : (
                  <p>{userData.phone}</p>
                )}
              </div>

              {/* Address Field */}
              <div className='flex items-center space-x-3'>
                <MapPin className='w-5 h-5 text-indigo-500' />
                {isEditing ? (
                  <input
                    type='text'
                    name='address'
                    value={editedData.address}
                    onChange={handleInputChange}
                    className='flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                ) : (
                  <p>{userData.address}</p>
                )}
              </div>

              {/* Company Field */}
              <div className='flex items-center space-x-3'>
                <Briefcase className='w-5 h-5 text-indigo-500' />
                {isEditing ? (
                  <input
                    type='text'
                    name='company'
                    value={editedData.company}
                    onChange={handleInputChange}
                    className='flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                ) : (
                  <p>{userData.company}</p>
                )}
              </div>

              {/* Join Date Field (non-editable) */}
              <div className='flex items-center space-x-3'>
                <Calendar className='w-5 h-5 text-indigo-500' />
                <p>{userData.joinDate}</p>
              </div>

              {/* Password Fields */}
              {isEditing && (
                <>
                  <div className='flex items-center space-x-3'>
                    <Lock className='w-5 h-5 text-indigo-500' />
                    <div className='flex-grow'>
                      <label htmlFor='currentPassword' className='block text-sm font-medium text-gray-700'>
                        Current Password
                      </label>
                      <input
                        type='password'
                        id='currentPassword'
                        name='currentPassword'
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className='mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Lock className='w-5 h-5 text-indigo-500' />
                    <div className='flex-grow'>
                      <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>
                        New Password
                      </label>
                      <input
                        type='password'
                        id='newPassword'
                        name='newPassword'
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className='mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Lock className='w-5 h-5 text-indigo-500' />
                    <div className='flex-grow'>
                      <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                        Confirm New Password
                      </label>
                      <input
                        type='password'
                        id='confirmPassword'
                        name='confirmPassword'
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className='mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            {passwordError && <p className='mt-2 text-sm text-red-600'>{passwordError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
