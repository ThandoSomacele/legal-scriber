import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const storageAccountName = process.env.VITE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.VITE_AUDIOS_CONTAINER_NAME;
const sasToken = process.env.VITE_AUDIOS_CONTAINER_SAS_TOKEN;

const blobServiceClient = new BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net/?${sasToken}`);

const containerClient = blobServiceClient.getContainerClient(containerName);

const cancelTranscription = async transcriptionUrl => {
  try {
    await axios.delete(transcriptionUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });
    console.log('Transcription cancelled successfully');
  } catch (error) {
    console.error('Error cancelling transcription:', error.message);
  }
};

const checkTranscriptionStatus = async url => {
  try {
    console.log('Checking transcription status...');
    console.log('Transcription URL:', url);

    const response = await axios.get(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
      timeout: 10000,
    });

    console.log('Transcription status response:', JSON.stringify(response.data, null, 2));
    return response.data.status;
  } catch (error) {
    console.error('Error checking transcription status:', error.message);
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      await cancelTranscription(url);
      throw new Error('Network error: Unable to connect to the transcription service. Please try again later.');
    }
    throw error;
  }
};
app.post('/upload-and-transcribe', upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    console.log('Starting file upload process...');

    const uploadPromises = req.files.map(async file => {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer);
      console.log(`File uploaded: ${blobName}`);

      // Since Blob anonymous access is enabled, we don't need to append the SAS token
      return blockBlobClient.url;
    });

    const blobUrls = await Promise.all(uploadPromises);
    console.log('All files uploaded successfully');

    const transcriptionApiUrl = `https://${process.env.VITE_SERVICE_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;
    const requestBody = {
      contentUrls: blobUrls,
      properties: {
        diarizationEnabled: false,
        wordLevelTimestampsEnabled: true,
        punctuationMode: 'DictatedAndAutomatic',
        profanityFilterMode: 'Masked',
      },
      locale: 'en-GB',
      displayName: 'Batch transcription',
    };

    console.log('Sending transcription request to Azure...');
    console.log('Transcription API URL:', transcriptionApiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
      timeout: 30000, // 30 seconds timeout
    });

    console.log('Transcription request successful');
    console.log('Transcription response:', JSON.stringify(transcriptionResponse.data, null, 2));

    res.status(200).json({ transcriptionUrl: transcriptionResponse.data.self });
  } catch (error) {
    console.error('Error in upload and transcribe:', error);
    console.error('Transcription error details:', error.response?.data || error.message);
    res.status(500).json({
      error: 'An error occurred while processing files and creating transcription',
      details: getErrorDetails(error),
    });
  }
});

app.get('/transcription-status', async (req, res) => {
  const { transcriptionUrl } = req.query;

  if (!transcriptionUrl) {
    return res.status(400).json({ error: 'Transcription URL is required', status: 'Failed' });
  }

  try {
    const status = await checkTranscriptionStatus(transcriptionUrl);
    res.status(200).json({ status });
  } catch (error) {
    console.error('Error in /transcription-status endpoint:', error.message);
    let errorMessage = 'An error occurred while checking the transcription status.';
    let statusCode = 500;

    if (error.message.includes('Network error')) {
      errorMessage = error.message;
      statusCode = 503; // Service Unavailable
    }

    // Always return a JSON response, even for errors
    res.status(statusCode).json({
      error: errorMessage,
      status: 'Failed',
    });
  }
});

function getErrorDetails(error) {
  if (error.response) {
    return `The server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
  } else if (error.request) {
    return 'No response was received from the server. There might be network connectivity issues.';
  } else {
    return `An unexpected error occurred: ${error.message}`;
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
