import React, { useState } from 'react';
import './App.css';
import Header from './components/layouts/Header';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';

function App() {
  const [transcriptionUrl, setTranscriptionUrl] = useState(null);

  const handleTranscriptionCreated = url => {
    setTranscriptionUrl(url);
  };

  return (
    <div className='flex flex-col space-y-10'>
      <Header />
      <MultiAudioUploader onTranscriptionCreated={handleTranscriptionCreated} />
      {transcriptionUrl && <TranscriptionDisplay transcriptionUrl={transcriptionUrl} />}
      <SummaryEditor />
    </div>
  );
}

export default App;
