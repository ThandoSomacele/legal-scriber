import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, Download } from 'lucide-react';
import UsageDashboard from './UsageDashboard';

const BillingPage = () => {
  // Mock user and billing data - in a real application, this would come from an API
  const [user, setUser] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);

  useEffect(() => {
    // Simulate fetching user and billing data
    const fetchData = async () => {
      // In a real application, you would fetch this data from your API
      const mockUser = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        plan: 'Professional',
        nextBillingDate: '2024-05-01',
      };
      const mockBillingHistory = [
        { id: 1, date: '2024-04-01', amount: 999, status: 'Paid' },
        { id: 2, date: '2024-03-01', amount: 999, status: 'Paid' },
        { id: 3, date: '2024-02-01', amount: 999, status: 'Paid' },
      ];

      setUser(mockUser);
      setBillingHistory(mockBillingHistory);
    };

    fetchData();
  }, []);

  if (!user) {
    return <div className='flex justify-center items-center h-screen'>Loading...</div>;
  }

  return (
    <div className='max-w-4xl mx-auto my-10 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-3xl font-bold text-indigo-800 mb-6'>Billing &amp; Subscription</h1>

      {/* Current Plan Section */}
      <div className='bg-white shadow-md rounded-lg overflow-hidden mb-8'>
        <div className='p-6'>
          <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
            <CreditCard className='w-6 h-6 mr-2' />
            Current Plan
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-gray-600'>Plan:</p>
              <p className='font-semibold'>{user.plan}</p>
            </div>
            <div>
              <p className='text-gray-600'>Next Billing Date:</p>
              <p className='font-semibold'>{user.nextBillingDate}</p>
            </div>
          </div>
          <button className='mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300'>
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Billing History Section */}
      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <div className='p-6'>
          <h2 className='text-2xl font-semibold text-indigo-700 mb-4 flex items-center'>
            <Clock className='w-6 h-6 mr-2' />
            Billing History
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-indigo-100'>
                  <th className='px-4 py-2 text-left'>Date</th>
                  <th className='px-4 py-2 text-left'>Amount</th>
                  <th className='px-4 py-2 text-left'>Status</th>
                  <th className='px-4 py-2 text-left'>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map(item => (
                  <tr key={item.id} className='border-b'>
                    <td className='px-4 py-2'>{item.date}</td>
                    <td className='px-4 py-2'>R{item.amount.toFixed(2)}</td>
                    <td className='px-4 py-2'>
                      <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm'>{item.status}</span>
                    </td>
                    <td className='px-4 py-2'>
                      <button className='text-indigo-600 hover:text-indigo-800 flex items-center'>
                        <Download className='w-4 h-4 mr-1' />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <UsageDashboard />
    </div>
  );
};

export default BillingPage;
