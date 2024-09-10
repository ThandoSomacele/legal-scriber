import { SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

export const speechToText = audioFileUrl => {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromSubscription(process.env.VITE_SPEECH_KEY, process.env.VITE_SERVICE_REGION);
    const audioConfig = AudioConfig.fromWavFileInput(audioFileUrl);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    let transcription = '';

    recognizer.recognizing = (s, e) => {
      console.log(`RECOGNIZING: Text=${e.result.text}`);
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason == ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
        transcription += e.result.text + ' ';
      } else if (e.result.reason == ResultReason.NoMatch) {
        console.log('NOMATCH: Speech could not be recognized.');
      }
    };

    recognizer.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);
      if (e.reason == CancellationReason.Error) {
        console.log(`CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
        reject(new Error(e.errorDetails));
      }
    };

    recognizer.sessionStopped = (s, e) => {
      console.log('\n    Session stopped event.');
      recognizer.stopContinuousRecognitionAsync();
      resolve(transcription.trim());
    };

    recognizer.startContinuousRecognitionAsync();
  });
};
