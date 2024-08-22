import express from 'express';
import multer from 'multer';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { EventEmitter } from 'events';
import { AzureOpenAI } from 'openai';
import modelContent from './src/lib/modelContent.js';

EventEmitter.defaultMaxListeners = 15;

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Azure Blob Storage configuration
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.VITE_AUDIOS_CONTAINER_NAME;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

// Create BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const generateSasUrl = blobName => {
  const blobSAS = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
    },
    sharedKeyCredential
  ).toString();
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${blobSAS}`;
};

// Configure axios-retry
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: '2024-04-01-preview',
});

async function summariseWithRetry(transcriptionResults, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} of ${maxRetries} to summarize with model: gpt-4o`);
      console.log('Using endpoint:', process.env.AZURE_OPENAI_ENDPOINT);

      const combinedTranscriptions = transcriptionResults
        .map(result => result.content.combinedRecognizedPhrases[0].display)
        .join('\n\n');

      const result = await client.chat.completions.create({
        model: 'gpt-4o', // This should match your deployment name
        messages: [
          {
            role: 'system',
            content: modelContent,
          },
          { role: 'user', content: `Please summarise the following legal transcription:\n\n${combinedTranscriptions}` },
        ],
        max_tokens: 4096,
        temperature: 0.1,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      });

      return result.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed. Error:`, JSON.stringify(error, null, 2));

      if (attempt === maxRetries - 1) {
        // If this was the last attempt, throw the error
        throw error;
      }

      // If the error is due to rate limiting, wait before retrying
      if (error.status === 429) {
        const retryAfter = error.headers['retry-after'] ? parseInt(error.headers['retry-after']) : 5;
        console.log(`Rate limit hit. Waiting for ${retryAfter} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      } else {
        // For other errors, wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

// async function testAzureOpenAI() {
//   try {
//     const result = await client.chat.completions.create({
//       model: 'gpt-4o',
//       messages: [{ role: 'user', content: 'Say hello' }],
//       max_tokens: 128,
//     });
//     console.log('Test response:', JSON.stringify(result, null, 2));
//   } catch (error) {
//     console.error('Test error:', JSON.stringify(error, null, 2));
//   }
// }

// // Call this function before your main logic
// await testAzureOpenAI();

app.post('/upload-and-transcribe', upload.array('files'), async (req, res) => {
  console.log('Starting file upload process...');
  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.buffer.length);
      const blobUrl = generateSasUrl(blobName);
      uploadedFiles.push(blobUrl);
    }

    console.log('All files uploaded successfully');

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

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    console.log('Transcription request successful');
    res.json({ transcriptionUrl: transcriptionResponse.data.self });
  } catch (error) {
    console.error('Error in /upload-and-transcribe endpoint:', error);
    res.status(500).json({ error: 'An error occurred during transcription', details: error.message });
  }
});

app.get('/transcription-status', async (req, res) => {
  const transcriptionUrl = req.query.transcriptionUrl;

  if (!transcriptionUrl) {
    return res.status(400).json({ error: 'Transcription URL is required' });
  }

  console.log('Checking transcription status...');

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
    res.status(500).json({ error: 'An error occurred while checking transcription status', details: error.message });
  }
});

app.post('/api/summarise', async (req, res) => {
  console.log('Received summarise request');
  try {
    const { transcriptionResults } = req.body;

    // Check if transcriptionResults is valid
    if (!transcriptionResults || !Array.isArray(transcriptionResults) || transcriptionResults.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty transcription results' });
    }

    // Estimate token count (rough estimation)
    const estimatedTokens = transcriptionResults.reduce((total, result) => {
      return total + result.content.combinedRecognizedPhrases[0].display.length / 4;
    }, 0);

    console.log(`Estimated tokens for summarisation: ${Math.ceil(estimatedTokens)}`);

    // Check if estimated tokens exceed a safe limit (e.g., 100K tokens)
    if (estimatedTokens > 100000) {
      return res.status(413).json({ error: 'Transcription too large to summarise in one request' });
    }

    const summary = await summariseWithRetry(transcriptionResults);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error.status === 429) {
      const retryAfter = parseInt(error.headers['retry-after'] || '60', 10);
      res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter,
        message: error.error?.message || 'Too many requests',
      });
    } else {
      res.status(500).json({
        error: 'An error occurred while generating the summary',
        details: error.message,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
