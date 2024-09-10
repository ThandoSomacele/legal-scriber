import React, { useState } from 'react';
import { Bell, Lock, Sliders, Save } from 'lucide-react';

const UserSettings = () => {
  // Mock settings data - in a real application, this would come from an API or state management system
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      pushNotifications: true,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
    },
    preferences: {
      language: 'en',
      theme: 'light',
    },
  });

  // Function to handle toggle changes
  const handleToggle = (category, setting) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [setting]: !prevSettings[category][setting],
      },
    }));
  };

  // Function to handle select changes
  const handleSelectChange = (category, setting, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [setting]: value,
      },
    }));
  };

  // Function to handle form submission
  const handleSubmit = e => {
    e.preventDefault();
    // Here you would typically send the updated settings to your backend
    console.log('Settings updated:', settings);
    // Show a success message to the user
    alert('Settings updated successfully!');
  };

  return (
    <div className='max-w-4xl mx-auto my-10 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-3xl font-bold text-indigo-800 mb-6'>User Settings</h1>
      <form onSubmit={handleSubmit} className='space-y-8'>
        {/* Notifications Settings */}
        <div className='bg-white shadow-md rounded-lg overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
              <Bell className='w-6 h-6 mr-2' />
              Notifications
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <label htmlFor='emailNotifications' className='font-medium text-gray-700'>
                  Email Notifications
                </label>
                <input
                  type='checkbox'
                  id='emailNotifications'
                  checked={settings.notifications.email}
                  onChange={() => handleToggle('notifications', 'email')}
                  className='form-checkbox h-5 w-5 text-indigo-600'
                />
              </div>
              <div className='flex items-center justify-between'>
                <label htmlFor='smsNotifications' className='font-medium text-gray-700'>
                  SMS Notifications
                </label>
                <input
                  type='checkbox'
                  id='smsNotifications'
                  checked={settings.notifications.sms}
                  onChange={() => handleToggle('notifications', 'sms')}
                  className='form-checkbox h-5 w-5 text-indigo-600'
                />
              </div>
              <div className='flex items-center justify-between'>
                <label htmlFor='pushNotifications' className='font-medium text-gray-700'>
                  Push Notifications
                </label>
                <input
                  type='checkbox'
                  id='pushNotifications'
                  checked={settings.notifications.pushNotifications}
                  onChange={() => handleToggle('notifications', 'pushNotifications')}
                  className='form-checkbox h-5 w-5 text-indigo-600'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Settings */}
        {/* <div className='bg-white shadow-md rounded-lg overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
              <Sliders className='w-6 h-6 mr-2' />
              Preferences
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <label htmlFor='language' className='font-medium text-gray-700'>
                  Language
                </label>
                <select
                  id='language'
                  value={settings.preferences.language}
                  onChange={e => handleSelectChange('preferences', 'language', e.target.value)}
                  className='form-select mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'>
                  <option value='en'>English</option>
                  <option value='fr'>French</option>
                  <option value='es'>Spanish</option>
                </select>
              </div>
              <div className='flex items-center justify-between'>
                <label htmlFor='theme' className='font-medium text-gray-700'>
                  Theme
                </label>
                <select
                  id='theme'
                  value={settings.preferences.theme}
                  onChange={e => handleSelectChange('preferences', 'theme', e.target.value)}
                  className='form-select mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'>
                  <option value='light'>Light</option>
                  <option value='dark'>Dark</option>
                  <option value='system'>System</option>
                </select>
              </div>
            </div>
          </div>
        </div> */}

        {/* Save Button */}
        <div className='flex justify-end'>
          <button
            type='submit'
            className='flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <Save className='w-5 h-5 mr-2' />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
