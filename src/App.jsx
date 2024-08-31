import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layouts/Header';
import Home from './components/layouts/Home';
import Dashboard from './components/Dashboard';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';
import Summaries from './components/Summaries';
import Transcriptions from './components/Transcriptions';
import Footer from './components/layouts/Footer';
import TermsAndConditions from './components/TermsAndConditions';
import PitchDeck from './components/PitchDeck';
import BusinessModelCanvas from './components/BusinessModelCanvas';

function App() {
  const [transcriptionUrl, setTranscriptionUrl] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [summaryType, setSummaryType] = useState('legal'); // New state for summary type

  const handleTranscriptionCreated = (url, type) => {
    setTranscriptionUrl(url);
    setSummaryType(type);
  };

  const handleSummaryGenerated = generatedSummary => {
    setSummary(generatedSummary);
  };

  const handleSaveSummary = updatedSummary => {
    setSummary(updatedSummary);
    // Here you can add logic to save the summary to a database or perform other actions
  };

  const handleSummaryTypeChange = type => {
    setSummaryType(type);
  };

  return (
    <Router>
      <div className='flex flex-col min-h-screen'>
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className='flex-grow mt-20'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/dashboard' element={isLoggedIn ? <Dashboard /> : <Navigate to='/' replace />} />
            <Route
              path='/transcribe'
              element={
                isLoggedIn ? (
                  <div className='flex flex-col space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='bg-white shadow-md rounded-lg p-6'>
                      <h2 className='text-2xl font-semibold text-indigo-700 mb-4'>Select Session Type</h2>
                      <div className='flex space-x-4'>
                        <button
                          onClick={() => handleSummaryTypeChange('legal')}
                          className={`px-4 py-2 rounded-md ${
                            summaryType === 'legal'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          } transition-colors duration-300`}>
                          Legal Hearing
                        </button>
                        <button
                          onClick={() => handleSummaryTypeChange('meeting')}
                          className={`px-4 py-2 rounded-md ${
                            summaryType === 'meeting'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          } transition-colors duration-300`}>
                          Meeting Minutes
                        </button>
                      </div>
                    </div>
                    <MultiAudioUploader onTranscriptionCreated={handleTranscriptionCreated} />
                    <TranscriptionDisplay
                      transcriptionUrl={transcriptionUrl}
                      onSummaryGenerated={handleSummaryGenerated}
                      summaryType={summaryType}
                    />
                    <SummaryEditor initialSummary={summary} onSave={handleSaveSummary} summaryType={summaryType} />
                  </div>
                ) : (
                  <Navigate to='/' replace />
                )
              }
            />
            <Route path='/summaries' element={isLoggedIn ? <Summaries /> : <Navigate to='/' replace />} />
            <Route path='/transcriptions' element={isLoggedIn ? <Transcriptions /> : <Navigate to='/' replace />} />
            <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
            <Route path='/pitch-deck' element={<PitchDeck />} />
            <Route path='/business-model-canvas' element={<BusinessModelCanvas />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
