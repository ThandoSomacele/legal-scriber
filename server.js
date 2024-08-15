import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import axiosRetry from 'axios-retry';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const accountName = process.env.VITE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.VITE_AUDIOS_CONTAINER_NAME;

// Create BlobServiceClient using DefaultAzureCredential
// Create BlobServiceClient using the connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Configure axios-retry
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

app.post('/upload-and-transcribe', upload.array('files'), async (req, res) => {
  console.log('Starting file upload process...');
  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file.buffer, file.buffer.length);
      console.log(`File uploaded: ${blobName}`);

      const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
      uploadedFiles.push(blobUrl);
    }

    console.log('All files uploaded successfully');

    // Prepare the transcription request
    const transcriptionApiUrl = `https://${process.env.VITE_SERVICE_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;

    const requestBody = {
      contentUrls: uploadedFiles,
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
    });

    console.log('Transcription request successful');
    console.log('Transcription response:', JSON.stringify(transcriptionResponse.data, null, 2));

    res.json({ transcriptionUrl: transcriptionResponse.data.self });
  } catch (error) {
    console.error('Error in /upload-and-transcribe endpoint:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: error.response.data.error?.message || 'An error occurred during transcription',
        details: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ error: 'No response received from the transcription service. Please try again later.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ error: 'An error occurred while setting up the transcription request' });
    }
  }
});

app.get('/transcription-status', async (req, res) => {
  const transcriptionUrl = req.query.transcriptionUrl;

  if (!transcriptionUrl) {
    return res.status(400).json({ error: 'Transcription URL is required' });
  }

  console.log('Checking transcription status...');
  console.log('Transcription URL:', transcriptionUrl);

  try {
    const statusResponse = await axios.get(transcriptionUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    console.log('Transcription status response:', JSON.stringify(statusResponse.data, null, 2));

    res.json({ status: statusResponse.data.status });
  } catch (error) {
    console.error('Error in /transcription-status endpoint:', error);
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error?.message || 'An error occurred while checking transcription status',
        details: error.response.data,
      });
    } else if (error.request) {
      res
        .status(500)
        .json({ error: 'Network error: Unable to connect to the transcription service. Please try again later.' });
    } else {
      res.status(500).json({ error: 'An error occurred while checking transcription status' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
