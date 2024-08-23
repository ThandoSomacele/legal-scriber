import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, Trash2 } from 'lucide-react';

const Summaries = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would be an API call
      // For now, we'll use dummy data
      const dummyData = [
        {
          id: 1,
          title: 'Smith vs Jones Hearing',
          date: '2024-05-15',
          excerpt: 'This case involved a property dispute...',
        },
        {
          id: 2,
          title: 'Corporate Merger Meeting',
          date: '2024-05-12',
          excerpt: 'The merger between ABC Corp and XYZ Inc...',
        },
        {
          id: 3,
          title: 'Patent Dispute Conference',
          date: '2024-05-10',
          excerpt: 'The patent infringement case between...',
        },
      ];
      setSummaries(dummyData);
    } catch (err) {
      setError('Failed to fetch summaries. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = id => {
    // In a real application, this would be an API call
    setSummaries(summaries.filter(summary => summary.id !== id));
  };

  if (isLoading) {
    return <div className='flex justify-center items-center h-screen'>Loading summaries...</div>;
  }

  if (error) {
    return <div className='text-red-500 text-center'>{error}</div>;
  }

  return (
    <div className='container mx-auto px-4 py-8 min-h-[100vh]'>
      <h1 className='text-3xl font-bold text-indigo-600 mb-8'>Your Summaries</h1>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {summaries.map(summary => (
          <div key={summary.id} className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold text-indigo-800 mb-2'>{summary.title}</h2>
            <p className='text-gray-600 mb-4'>{summary.date}</p>
            <p className='text-gray-800 mb-4'>{summary.excerpt}</p>
            <div className='flex justify-between items-center'>
              <Link to={`/summary/${summary.id}`} className='text-indigo-600 hover:text-indigo-800 flex items-center'>
                <FileText className='mr-1' size={18} />
                View
              </Link>
              <Link
                to={`/edit-summary/${summary.id}`}
                className='text-green-600 hover:text-green-800 flex items-center'>
                <Edit className='mr-1' size={18} />
                Edit
              </Link>
              <button
                onClick={() => handleDelete(summary.id)}
                className='text-red-600 hover:text-red-800 flex items-center'>
                <Trash2 className='mr-1' size={18} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summaries;
