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

const createBlobService = () => {
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/${containerName}?${sasToken}`
  );
  return blobServiceClient.getContainerClient(containerName);
};

app.post('/upload-and-transcribe', upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    const containerClient = createBlobService();

    const uploadPromises = req.files.map(async file => {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer);
      return `${blockBlobClient.url}?${sasToken}`;
    });

    const sasUrls = await Promise.all(uploadPromises);

    // Updated transcription API URL
    const transcriptionApiUrl = `https://${process.env.VITE_SERVICE_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;
    const requestBody = {
      contentUrls: sasUrls,
      properties: {
        diarizationEnabled: false,
        wordLevelTimestampsEnabled: true,
        punctuationMode: 'DictatedAndAutomatic',
        profanityFilterMode: 'Masked',
      },
      locale: 'en-GB',
      displayName: 'Batch transcription',
    };

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    res.status(200).json({ transcriptionUrl: transcriptionResponse.data.self });
  } catch (error) {
    console.error('Error in upload and transcribe:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).json({
      error: 'An error occurred while processing files and creating transcription',
      details: error.message,
    });
  }
});

app.get('/transcription-status', async (req, res) => {
  const { transcriptionUrl } = req.query;

  if (!transcriptionUrl) {
    return res.status(400).send('Transcription URL is required');
  }

  try {
    const response = await axios.get(transcriptionUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    res.status(200).json({ status: response.data.status });
  } catch (error) {
    console.error('Error checking transcription status:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).json({
      error: 'Error checking transcription status',
      details: error.message,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
