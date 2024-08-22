import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/layouts/Header';
import Home from './components/layouts/Home';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';
import FooterSection from './components/layouts/FooterSection';
// import PrivacyPolicy from './components/layouts/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';

function App() {
  const [transcriptionUrl, setTranscriptionUrl] = useState(null);
  const [summary, setSummary] = useState('');

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
        <Header />
        <main className='flex-grow'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route
              path='/transcribe'
              element={
                <div className='flex flex-col space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                  <MultiAudioUploader onTranscriptionCreated={handleTranscriptionCreated} />
                  <TranscriptionDisplay
                    transcriptionUrl={transcriptionUrl}
                    onSummaryGenerated={handleSummaryGenerated}
                  />
                  <SummaryEditor initialSummary={summary} onSave={handleSaveSummary} />
                </div>
              }
            />
            {/* <Route path='/privacy-policy' element={<PrivacyPolicy />} /> */}
            <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
          </Routes>
        </main>
        <FooterSection />
      </div>
    </Router>
  );
}

export default App;
