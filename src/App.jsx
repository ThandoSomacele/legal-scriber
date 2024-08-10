import './App.css';
import Header from './components/layouts/Header';
import MultiAudioUploader from './components/ui/MultiAudioUploader';
import TranscriptionDisplay from './components/ui/TranscriptionDisplay';
import SummaryEditor from './components/ui/SummaryEditor';

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
