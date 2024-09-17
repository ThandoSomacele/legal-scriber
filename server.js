import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import transcriptionRoutes from './src/routes/transcriptions.js';
import summaryRoutes from './src/routes/summaries.js';
import userRoutes from './src/routes/user.js';
import multer from 'multer';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import cors from 'cors';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { EventEmitter } from 'events';
import { AzureOpenAI } from 'openai';
import { parseString } from 'xml2js';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import Transcription from './src/models/Transcription.js';
import legalModelContent from './src/lib/legalModelContent.js';
import standardMeetingModelContent from './src/lib/standardMeetingModelContent.js';
import envConfig from './envConfig.js';
import dbConnect from './src/db.js';

dotenv.config();

dbConnect();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: envConfig.frontendUrl,
    credentials: true,
  })
);

// Set a reasonable size limit for JSON payloads
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transcriptions', transcriptionRoutes);
app.use('/api/summaries', summaryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

EventEmitter.defaultMaxListeners = 15;

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, 'dist')));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

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

async function summariseWithRetry(transcriptionResults, meetingType, maxRetries = 5) {
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

  // Select the appropriate modelContent based on meetingType
  const selectedModelContent = meetingType === 'legal' ? legalModelContent : standardMeetingModelContent;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length}, attempt ${attempt + 1} of ${maxRetries}`);

        const prompt =
          chunkIndex === 0
            ? `Please summarise the following ${
                meetingType === 'legal' ? 'legal transcription' : 'standard meeting'
              }:\n\n${chunk}`
            : `Please continue summarising the ${
                meetingType === 'legal' ? 'legal transcription' : 'standard meeting'
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

async function checkAndUpdateTranscriptionStatus(transcription) {
  console.log(`Checking status for transcription ${transcription._id}`);

  if (!transcription.transcriptionUrl || typeof transcription.transcriptionUrl !== 'string') {
    console.log(`Skipping transcription ${transcription._id}: Invalid or missing transcriptionUrl`);
    await Transcription.findByIdAndUpdate(transcription._id, {
      status: 'error',
      errorDetails: 'Invalid or missing transcriptionUrl',
    });
    return;
  }

  try {
    console.log(`Fetching status from ${transcription.transcriptionUrl}`);
    const statusResponse = await axios.get(transcription.transcriptionUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    let status;
    let detailedResponse = {};

    if (statusResponse.headers['content-type'].includes('application/xml')) {
      const result = await new Promise((resolve, reject) => {
        parseString(statusResponse.data, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      status = result.transcription.status[0];
      detailedResponse = result.transcription;
    } else {
      status = statusResponse.data.status;
      detailedResponse = statusResponse.data;
    }

    console.log(`Transcription ${transcription._id} status:`, status);
    console.log('Detailed response:', JSON.stringify(detailedResponse, null, 2));

    let updatedStatus = status;
    if (status === 'Succeeded') {
      updatedStatus = 'completed';
    } else if (status === 'Failed') {
      updatedStatus = 'failed';
    } else if (status === 'Running') {
      updatedStatus = 'processing';
    }

    await Transcription.findByIdAndUpdate(transcription._id, {
      status: updatedStatus,
      detailedResponse: JSON.stringify(detailedResponse),
    });

    if (updatedStatus === 'completed') {
      console.log(`Fetching content for completed transcription ${transcription._id}`);

      // Fetch the files list
      const filesUrl = detailedResponse.links.files;
      console.log(`Fetching files list from: ${filesUrl}`);
      const filesResponse = await axios.get(filesUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
        },
      });

      const files = filesResponse.data.values;
      console.log('Files list:', JSON.stringify(files, null, 2));

      if (!files || files.length === 0) {
        throw new Error('No transcription files found');
      }

      // Find the transcription file (usually the one with kind: 'Transcription')
      const transcriptionFile = files.find(file => file.kind === 'Transcription');

      if (!transcriptionFile) {
        throw new Error('Transcription file not found in the files list');
      }

      const contentUrl = transcriptionFile.links.contentUrl;
      console.log(`Fetching transcription content from URL: ${contentUrl}`);

      const contentResponse = await axios.get(contentUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
        },
      });
      // Save the content:
      const content = contentResponse.data;
      await Transcription.findByIdAndUpdate(transcription._id, {
        content: JSON.stringify(content),
        completedAt: new Date(),
      });
      console.log(`Content saved for transcription ${transcription._id}`);
    } else if (updatedStatus === 'failed') {
      const errorDetails = detailedResponse.properties?.error?.message || 'Unknown error occurred';
      await Transcription.findByIdAndUpdate(transcription._id, {
        errorDetails,
      });
      console.log(`Transcription ${transcription._id} failed. Error details: ${errorDetails}`);
    }
  } catch (error) {
    let detailedResponse = {};

    console.error(`Error updating transcription ${transcription._id} status:`, error);
    console.error('Error details:', error.response?.data);
    console.error('Detailed response:', JSON.stringify(detailedResponse, null, 2));
    await Transcription.findByIdAndUpdate(transcription._id, {
      status: 'error',
      errorDetails: error.message || 'Unknown error occurred',
    });
  }
}
// Schedule a job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running transcription status check...');
  try {
    const pendingTranscriptions = await Transcription.find({
      status: { $in: ['pending', 'processing', 'submitted'] },
      transcriptionUrl: { $exists: true, $ne: null },
    });

    console.log(`Found ${pendingTranscriptions.length} pending transcriptions`);

    for (const transcription of pendingTranscriptions) {
      await checkAndUpdateTranscriptionStatus(transcription);
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

app.post('/upload-and-transcribe', upload.array('files'), async (req, res) => {
  console.log('Starting file upload and transcription process...');
  try {
    const { meetingType } = req.body;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log(`Uploading ${req.files.length} file(s) for ${meetingType} transcription`);

    const uploadedFiles = [];

    for (const file of req.files) {
      console.log(`Uploading file: ${file.originalname}`);
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.buffer.length);
      const blobUrl = generateSasUrl(blobName);
      uploadedFiles.push(blobUrl);
      console.log(`File uploaded successfully: ${blobName}`);
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
      displayName: `Transcription_${meetingType}_${Date.now()}`,
    };

    console.log('Sending transcription request to Azure...');

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    console.log('Transcription request successful');
    console.log('Transcription URL:', transcriptionResponse.data.self);

    // Save the transcription to the database
    const transcription = new Transcription({
      user: userId,
      meetingType,
      status: 'processing',
      transcriptionUrl: transcriptionResponse.data.self,
    });

    await transcription.save();
    console.log('Transcription saved to database with ID:', transcription._id);

    res.json({
      transcriptionId: transcription._id,
      transcriptionUrl: transcriptionResponse.data.self,
      meetingType: meetingType,
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

    // Check if the response is XML
    if (statusResponse.headers['content-type'].includes('application/xml')) {
      parseString(statusResponse.data, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err);
          return res.status(500).json({ error: 'Error parsing XML response' });
        }
        const status = result.transcription.status[0];
        console.log('Transcription status:', status);
        res.json({ status });
      });
    } else {
      // Assume JSON response
      console.log('Transcription status response:', JSON.stringify(statusResponse.data, null, 2));
      res.json({ status: statusResponse.data.status });
    }
  } catch (error) {
    console.error('Error in /transcription-status endpoint:', error);
    res.status(500).json({ error: 'An error occurred while checking transcription status', details: error.message });
  }
});

app.post('/api/summarise', async (req, res) => {
  console.log('Received summarise request');
  try {
    const { transcriptionResults, meetingType } = req.body;

    if (!transcriptionResults || !Array.isArray(transcriptionResults) || transcriptionResults.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty transcription results' });
    }

    if (!meetingType || !['legal', 'meeting'].includes(meetingType)) {
      return res.status(400).json({ error: 'Invalid summary type' });
    }

    const summary = await summariseWithRetry(transcriptionResults, meetingType);
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

console.log('Starting server.js');
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', envConfig.apiUrl);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const port = process.env.PORT || 3001;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});
