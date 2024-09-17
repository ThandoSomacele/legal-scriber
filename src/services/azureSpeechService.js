// // src/services/azureSpeechService.js

// import {
//   SpeechConfig,
//   AudioConfig,
//   SpeechRecognizer,
//   AudioInputStream,
//   ResultReason,
//   CancellationReason,
// } from 'microsoft-cognitiveservices-speech-sdk';

// export const speechToText = async audioFileUrl => {
//   return new Promise((resolve, reject) => {
//     const speechConfig = SpeechConfig.fromSubscription(process.env.VITE_SPEECH_KEY, process.env.VITE_SERVICE_REGION);

//     // Enable detailed logging
//     speechConfig.setProperty('Speech_LogFilename', 'speech_log.txt');

//     // Create a push stream
//     const pushStream = AudioInputStream.createPushStream();

//     // Fetch the audio file and push it to the stream
//     fetch(audioFileUrl)
//       .then(response => response.arrayBuffer())
//       .then(arrayBuffer => {
//         console.log(`Audio file size: ${arrayBuffer.byteLength} bytes`);
//         pushStream.write(new Uint8Array(arrayBuffer));
//         pushStream.close();
//       })
//       .catch(error => {
//         console.error('Error fetching audio file:', error);
//         reject(error);
//       });

//     const audioConfig = AudioConfig.fromStreamInput(pushStream);
//     const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

//     let transcription = '';

//     recognizer.recognizing = (s, e) => {
//       console.log(`RECOGNIZING: Text=${e.result.text}`);
//     };

//     recognizer.recognized = (s, e) => {
//       if (e.result.reason == ResultReason.RecognizedSpeech) {
//         console.log(`RECOGNIZED: Text=${e.result.text}`);
//         transcription += e.result.text + ' ';
//       } else if (e.result.reason == ResultReason.NoMatch) {
//         console.log('NOMATCH: Speech could not be recognized.');
//         console.log('NoMatch details:', e.result.noMatchDetails);
//       }
//     };

//     recognizer.canceled = (s, e) => {
//       console.log(`CANCELED: Reason=${e.reason}`);
//       if (e.reason == CancellationReason.Error) {
//         console.log(`CANCELED: ErrorCode=${e.errorCode}`);
//         console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
//         console.log('CANCELED: Did you update the subscription info?');
//         reject(new Error(e.errorDetails));
//       }
//     };

//     recognizer.sessionStopped = (s, e) => {
//       console.log('\n    Session stopped event.');
//       recognizer.stopContinuousRecognitionAsync();
//       if (transcription.trim() === '') {
//         reject(new Error('No speech could be recognized'));
//       } else {
//         resolve(transcription.trim());
//       }
//     };

//     recognizer.startContinuousRecognitionAsync(
//       () => {
//         console.log('Recognition started');
//       },
//       error => {
//         console.log(`Error starting recognition: ${error}`);
//         reject(error);
//       }
//     );
//   });
// };
