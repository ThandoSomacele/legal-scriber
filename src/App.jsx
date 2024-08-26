import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layouts/Header';
import Home from './components/layouts/Home';
import Dashboard from './components/Dashboard';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';
import Summaries from './components/Summaries';
import Transcriptions from './components/Transcriptions'; // Import the new Transcriptions component
import Footer from './components/layouts/Footer';
import TermsAndConditions from './components/TermsAndConditions';
import PitchDeck from './components/PitchDeck';
import BusinessModelCanvas from './components/BusinessModelCanvas';

function App() {
  const [transcriptionUrl, setTranscriptionUrl] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleTranscriptionCreated = url => {
    setTranscriptionUrl(url);
  };

  const handleSummaryGenerated = generatedSummary => {
    setSummary(generatedSummary);
  };

  const handleSaveSummary = updatedSummary => {
    setSummary(updatedSummary);
    // Here you can add logic to save the summary to a database or perform other actions
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
                    <MultiAudioUploader onTranscriptionCreated={handleTranscriptionCreated} />
                    <TranscriptionDisplay
                      transcriptionUrl={transcriptionUrl}
                      onSummaryGenerated={handleSummaryGenerated}
                    />
                    <SummaryEditor initialSummary={summary} onSave={handleSaveSummary} />
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
