import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Header from './components/layouts/Header';
import Home from './components/layouts/Home';
import Dashboard from './components/Dashboard';
import MainLayout from './components/layouts/MainLayout';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';
import Summaries from './components/Summaries';
import Transcriptions from './components/Transcriptions';
import Footer from './components/layouts/Footer';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import SignUp from './components/SignUp';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import UserSettings from './components/UserSettings';
import BillingPage from './components/BillingPage';
import SubscriptionPlans from './components/SubscriptionPlans';
import SubscriptionSuccess from './components/SubscriptionSuccess';
import SubscriptionCancel from './components/SubscriptionCancel';
import PlanChange from './components/PlanChange';
import UsageDashboard from './components/UsageDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [transcriptionId, setTranscriptionId] = useState(null);
  const [summaryId, setSummaryId] = useState(null);
  const [meetingType, setMeetingType] = useState('legal');

  useEffect(() => {
    // Load stored transcription and summary IDs on component mount
    const storedTranscription = localStorage.getItem('transcription');
    const storedSummary = localStorage.getItem('summary');

    if (storedTranscription) {
      const parsedTranscription = JSON.parse(storedTranscription);
      setTranscriptionId(parsedTranscription._id);
      setMeetingType(parsedTranscription.meetingType);
    }

    if (storedSummary) {
      const parsedSummary = JSON.parse(storedSummary);
      setSummaryId(parsedSummary._id);
    }
  }, []);

  const handleTranscriptionCreated = (id, type) => {
    // Clear previous transcription and summary data
    setTranscriptionId(null);
    setSummaryId(null);
    localStorage.removeItem('transcription');
    localStorage.removeItem('summary');

    // Set new transcription data
    setTranscriptionId(id);
    setMeetingType(type);
  };

  const handleSummaryGenerated = id => {
    setSummaryId(id);
  };

  const handleMeetingTypeChange = type => {
    setMeetingType(type);
  };

  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/login' element={<Login />} />
            <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />

            {/* Protected Routes - These will have the sidebar when logged in */}
            <Route
              path='/transcribe'
              element={
                <ProtectedRoute>
                  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
                    <div className='bg-white shadow-md rounded-lg p-6'>
                      <h2 className='text-2xl font-semibold text-indigo-700 mb-4'>Select Meeting Type</h2>
                      <div className='flex space-x-4'>
                        <button
                          onClick={() => handleMeetingTypeChange('legal')}
                          className={`px-4 py-2 rounded-md ${
                            meetingType === 'legal'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          } transition-colors duration-300`}>
                          Legal Hearing
                        </button>
                        <button
                          onClick={() => handleMeetingTypeChange('meeting')}
                          className={`px-4 py-2 rounded-md ${
                            meetingType === 'meeting'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          } transition-colors duration-300`}>
                          Standard Meeting
                        </button>
                      </div>
                    </div>
                    <MultiAudioUploader onTranscriptionCreated={handleTranscriptionCreated} meetingType={meetingType} />
                    <TranscriptionDisplay
                      transcriptionId={transcriptionId}
                      onSummaryGenerated={handleSummaryGenerated}
                      meetingType={meetingType}
                    />
                    <SummaryEditor summaryId={summaryId} meetingType={meetingType} />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path='/settings'
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />

            {/* Subscription Routes */}
            <Route
              path='/subscribe'
              element={
                <ProtectedRoute>
                  <SubscriptionPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path='/subscription/*'
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path='success' element={<SubscriptionSuccess />} />
                    <Route path='cancel' element={<SubscriptionCancel />} />
                    <Route path='change' element={<PlanChange />} />
                    <Route path='usage' element={<UsageDashboard />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path='/admin/*'
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Routes>
                      <Route path='dashboard' element={<AdminDashboard />} />
                    </Routes>
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
