import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, Trash2, Download } from 'lucide-react';

const Transcriptions = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would be an API call
      // For now, we'll use dummy data
      const dummyData = [
        { id: 1, title: 'Smith vs Jones Hearing', date: '2024-05-15', duration: '1h 30m', status: 'Completed' },
        { id: 2, title: 'Corporate Merger Meeting', date: '2024-05-12', duration: '2h 15m', status: 'In Progress' },
        { id: 3, title: 'Patent Dispute Conference', date: '2024-05-10', duration: '45m', status: 'Completed' },
      ];
      setTranscriptions(dummyData);
    } catch (err) {
      setError('Failed to fetch transcriptions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = id => {
    // In a real application, this would be an API call
    setTranscriptions(transcriptions.filter(transcription => transcription.id !== id));
  };

  if (isLoading) {
    return <div className='flex justify-center items-center h-screen'>Loading transcriptions...</div>;
  }

  if (error) {
    return <div className='text-red-500 text-center'>{error}</div>;
  }

  return (
    <div className='container mx-auto px-4 py-8 min-h-[100vh]'>
      <h1 className='text-3xl font-bold text-indigo-600 mb-8'>Your Transcriptions</h1>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white'>
          <thead className='bg-indigo-600 text-white'>
            <tr>
              <th className='py-3 px-4 text-left'>Title</th>
              <th className='py-3 px-4 text-left'>Date</th>
              <th className='py-3 px-4 text-left'>Duration</th>
              <th className='py-3 px-4 text-left'>Status</th>
              <th className='py-3 px-4 text-left'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {transcriptions.map(transcription => (
              <tr key={transcription.id}>
                <td className='py-4 px-4'>{transcription.title}</td>
                <td className='py-4 px-4'>{transcription.date}</td>
                <td className='py-4 px-4'>{transcription.duration}</td>
                <td className='py-4 px-4'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transcription.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {transcription.status}
                  </span>
                </td>
                <td className='py-4 px-4'>
                  <div className='flex space-x-2'>
                    <Link to={`/transcription/${transcription.id}`} className='text-indigo-600 hover:text-indigo-800'>
                      <FileText size={18} />
                    </Link>
                    <Link
                      to={`/edit-transcription/${transcription.id}`}
                      className='text-green-600 hover:text-green-800'>
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(transcription.id)} className='text-red-600 hover:text-red-800'>
                      <Trash2 size={18} />
                    </button>
                    <button className='text-blue-600 hover:text-blue-800'>
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transcriptions;
