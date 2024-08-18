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
import { AzureOpenAI } from 'openai';
import { setTimeout } from 'timers/promises';

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
const openAiClient = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: '2024-04-01-preview',
});

async function summariseWithRetry(transcriptionResults, maxRetries = 5) {
  const tokenLimit = 1000; // Tokens per minute limit
  let tokensUsed = 0;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const combinedTranscriptions = transcriptionResults
        .map(result => result.content.combinedRecognizedPhrases[0].display)
        .join('\n\n');
      // Estimate tokens in the input (this is a rough estimate)
      const inputTokens = Math.ceil(combinedTranscriptions.length / 4); // Use ceil to round up

      if (tokensUsed + inputTokens > tokenLimit) {
        const waitTime = 60 - ((Date.now() / 1000) % 60); // Wait until next minute
        await setTimeout(waitTime * 1000);
        tokensUsed = 0;
      }

      // Ensure max_tokens is always a positive integer
      const maxTokens = Math.max(1, Math.floor(tokenLimit - inputTokens));

      const response = await openAiClient.chat.completions.create({
        deployment: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant specialised in summarising legal transcriptions. Your task is to provide accurate, concise, yet comprehensive summaries that capture key legal points, arguments, and decisions. Use appropriate legal terminology and maintain the original context and nuances. Focus on the most pertinent information and organise it logically.',
          },
          {
            role: 'user',
            content: `Please summarise the following legal transcription. Ensure all critical legal points, arguments, and decisions are accurately captured. Organise the summary in a clear, structured format:\n\n${combinedTranscriptions}`,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.1,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      });

      tokensUsed += inputTokens + response.usage.total_tokens;
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error in summariseWithRetry:', error);
      if (error.status === 429 && attempt < maxRetries - 1) {
        const retryAfter = Math.min(parseInt(error.headers['retry-after'] || '60', 10), 300);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await setTimeout(retryAfter * 1000);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

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
    const summary = await summariseWithRetry(transcriptionResults);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error.status === 429) {
      const retryAfter = parseInt(error.headers['retry-after'] || '3600', 10);
      res.status(503).json({
        error: 'Service temporarily unavailable due to high demand. Please try again later.',
        retryAfter: retryAfter,
      });
    } else if (error.status === 404 && error.code === 'DeploymentNotFound') {
      res
        .status(500)
        .json({ error: 'GPT-4 Turbo deployment not found. Please check your Azure OpenAI configuration.' });
    } else if (error.status === 401) {
      res.status(500).json({ error: 'Authentication failed. Please check your Azure OpenAI API key.' });
    } else {
      res.status(500).json({ error: 'An error occurred while generating the summary', details: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
