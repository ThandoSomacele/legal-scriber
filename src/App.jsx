import React, { useState } from 'react';
import Header from './components/layouts/Header';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';

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
    <div className='flex flex-col space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <Header />
      <MultiAudioUploader onTranscriptionCreated={handleTranscriptionCreated} />
      <TranscriptionDisplay transcriptionUrl={transcriptionUrl} onSummaryGenerated={handleSummaryGenerated} />
      <SummaryEditor initialSummary={summary} onSave={handleSaveSummary} />
    </div>
  );
}

export default App;
