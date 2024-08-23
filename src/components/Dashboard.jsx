import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, BarChart2, Plus, Download } from 'lucide-react';

const Dashboard = () => {
  // Placeholder data - in a real app, this would be fetched from an API
  const recentTranscriptions = [
    { id: 1, title: 'Smith vs Jones Hearing', date: '2024-05-15', duration: '1h 30m' },
    { id: 2, title: 'Corporate Merger Meeting', date: '2024-05-12', duration: '2h 15m' },
    { id: 3, title: 'Patent Dispute Conference', date: '2024-05-10', duration: '45m' },
  ];

  const stats = [
    { title: 'Total Transcriptions', value: 28 },
    { title: 'Hours Transcribed', value: '56.5' },
    { title: 'Summaries Generated', value: 22 },
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>Dashboard</h1>

      {/* Quick Action Buttons */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
        <Link
          to='/transcribe'
          className='flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150'>
          <Plus className='mr-2' />
          New Transcription
        </Link>
        <Link
          to='/summaries'
          className='flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150'>
          <FileText className='mr-2' />
          View Summaries
        </Link>
      </div>

      {/* Statistics */}
      <div className='bg-white shadow rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Statistics</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {stats.map((stat, index) => (
            <div key={index} className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm font-medium text-gray-500'>{stat.title}</p>
              <p className='mt-1 text-3xl font-semibold text-gray-900'>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transcriptions */}
      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Recent Transcriptions</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Title
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Duration
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {recentTranscriptions.map(transcription => (
                <tr key={transcription.id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <FileText className='flex-shrink-0 h-5 w-5 text-gray-400' />
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>{transcription.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{transcription.date}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{transcription.duration}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <a href='#' className='text-indigo-600 hover:text-indigo-900 mr-4'>
                      View
                    </a>
                    <a href='#' className='text-green-600 hover:text-green-900'>
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
