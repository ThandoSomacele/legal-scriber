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
import legalModelContent from './src/lib/legalModelContent.js';
import meetingMinutesModelContent from './src/lib/meetingMinutesModelContent.js';

EventEmitter.defaultMaxListeners = 15;

dotenv.config();

const app = express();
const port = 3000;

// Set a reasonable size limit for JSON payloads
app.use(express.json({ limit: '10mb' })); // Increased from default, but still secure

app.use(cors());

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

async function summariseWithRetry(transcriptionResults, summaryType, maxRetries = 5) {
  const maxInputLength = 120000; // Slightly less than the 128,000 max to allow for some buffer
  let fullSummary = '';

  // Combine all transcription results
  const combinedTranscriptions = transcriptionResults
    .map(result => result.content.combinedRecognizedPhrases[0].display)
    .join('\n\n');

  // Split the combined transcriptions into chunks
  const chunks = [];
  for (let i = 0; i < combinedTranscriptions.length; i += maxInputLength) {
    chunks.push(combinedTranscriptions.slice(i, i + maxInputLength));
  }

  console.log(`Processing ${chunks.length} chunks for summarisation`);

  // Select the appropriate modelContent based on summaryType
  const selectedModelContent = summaryType === 'legal' ? legalModelContent : meetingMinutesModelContent;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length}, attempt ${attempt + 1} of ${maxRetries}`);

        const prompt =
          chunkIndex === 0
            ? `Please summarise the following ${
                summaryType === 'legal' ? 'legal transcription' : 'meeting minutes'
              }:\n\n${chunk}`
            : `Please continue summarising the ${
                summaryType === 'legal' ? 'legal transcription' : 'meeting minutes'
              }. Here's the next part:\n\n${chunk}`;

        const result = await client.chat.completions.create({
          model: 'gpt-4o', // Make sure this matches your deployment name
          messages: [
            { role: 'system', content: selectedModelContent },
            { role: 'user', content: prompt },
          ],
          max_tokens: 4096,
          temperature: 0.1,
          top_p: 0.95,
          frequency_penalty: 0.2,
          presence_penalty: 0.1,
        });

        fullSummary += result.choices[0].message.content + '\n\n';
        break; // Success, move to the next chunk
      } catch (error) {
        console.error(
          `Attempt ${attempt + 1} failed for chunk ${chunkIndex + 1}. Error:`,
          JSON.stringify(error, null, 2)
        );

        if (attempt === maxRetries - 1) {
          throw error; // Throw error after all retries are exhausted
        }

        if (error.status === 429) {
          const retryAfter = error.headers['retry-after'] ? parseInt(error.headers['retry-after']) : 5;
          console.log(`Rate limit hit. Waiting for ${retryAfter} seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  return fullSummary.trim();
}

app.post('/upload-and-transcribe', upload.array('files'), async (req, res) => {
  console.log('Starting file upload process...');
  try {
    const uploadedFiles = [];
    const summaryType = req.body.summaryType || 'legal'; // Default to 'legal' if not provided

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
        diarizationEnabled: true,
        wordLevelTimestampsEnabled: true,
        punctuationMode: 'DictatedAndAutomatic',
        profanityFilterMode: 'Masked',
      },
      locale: 'en-GB',
      displayName: `Transcription_${summaryType}_${Date.now()}`, // Include summaryType in the display name
    };

    console.log('Sending transcription request to Azure...');

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    console.log('Transcription request successful');

    // Store the summaryType along with the transcriptionUrl in the response
    res.json({
      transcriptionUrl: transcriptionResponse.data.self,
      summaryType: summaryType,
    });
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
    const { transcriptionResults, summaryType } = req.body;

    if (!transcriptionResults || !Array.isArray(transcriptionResults) || transcriptionResults.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty transcription results' });
    }

    if (!summaryType || !['legal', 'meeting'].includes(summaryType)) {
      return res.status(400).json({ error: 'Invalid summary type' });
    }

    const summary = await summariseWithRetry(transcriptionResults, summaryType);
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
