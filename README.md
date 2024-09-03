# Legal Scriber

Legal Scriber is a React-based web application designed to assist legal professionals in transcribing and summarising audio recordings. It provides features for uploading audio files, transcribing them, and generating summaries of the transcribed content.

## Features

- Multi-audio file upload
- Audio transcription using Azure Speech Services
- Transcription display and editing
- Summary generation and editing with Markdown support
- Responsive design using Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/legal-scriber.git
   cd legal-scriber
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Azure credentials:

   ```
   SPEECH_KEY=your_speech_key
   SERVICE_REGION=your_service_region
   STORAGE_ACCOUNT_NAME=your_storage_account_name
   AUDIOS_CONTAINER_NAME=your_audios_container_name
   AUDIOS_CONTAINER_SAS_TOKEN=your_audios_container_sas_token
   AUDIO_CONTAINER_SAS_TOKEN=your_audio_container_sas_token
   TRANSCRIPTIONS_CONTAINER_NAME=your_transcriptions_container_name
   TRANSCRIPTIONS_CONTAINER_SAS_TOKEN=your_transcriptions_container_sas_token
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
Legal Scriber Project
│
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Home.jsx
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── PricingSection.jsx
│   │   ├── AboutUsSection.jsx
│   │   ├── ContactUsSection.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transcriptions.jsx
│   │   ├── Summaries.jsx
│   │   ├── TranscriptionDisplay.jsx
│   │   ├── SummaryEditor.jsx
│   │   ├── MultiAudioUploader.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── TermsAndConditions.jsx
│   │   ├── MarkdownCheatsheet.jsx
│   │   └── Button.jsx
│   ├── contexts/
│   │   └── ApiContext.js
│   ├── lib/
│   │   ├── legalModelContent.js
│   │   ├── meetingMinutesModelContent.js
│   │   ├── legalPlaceHolderTranscription.js
│   │   └── excomeetingPlaceHolderTranscription.js
│   ├── styles/
│   │   ├── index.css
│   │   └── SummaryEditor.css
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│   └── [static assets]
│
├── .github/
│   └── workflows/
│       └── azure-deploy.yml
│
├── server.js
|
├── node_modules/
│
├── dist/
│
├── .env
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslintrc.js
```

## Built With

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Azure Speech Services](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/) - For audio transcription

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc.
