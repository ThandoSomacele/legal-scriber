import './App.css';
import Header from './components/layouts/Header';
import MultiAudioUploader from './components/MultiAudioUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import SummaryEditor from './components/SummaryEditor';

function App() {
  return (
    <div className='flex flex-col space-y-10'>
      <Header />
      <MultiAudioUploader />
      <TranscriptionDisplay />
      <SummaryEditor />
    </div>
  );
}

export default App;
