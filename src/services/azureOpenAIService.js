// src/services/azureOpenAIService.js
import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Add debugging
console.log('Azure OpenAI Service - Environment variables:');
console.log('API Key:', process.env.AZURE_OPENAI_API_KEY ? 'Set' : 'Not Set');
console.log('Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);

const initializeOpenAIClient = () => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

  // Add more detailed logging
  console.log('Initializing Azure OpenAI client with:');
  console.log('- API Key:', apiKey ? '[REDACTED]' : 'undefined');
  console.log('- Endpoint:', endpoint);

  if (!apiKey || !endpoint) {
    const missingVars = [];
    if (!apiKey) missingVars.push('AZURE_OPENAI_API_KEY');
    if (!endpoint) missingVars.push('AZURE_OPENAI_ENDPOINT');

    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` + 'Please check your .env file.'
    );
  }

  try {
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: '2024-04-01-preview',
      defaultDeployment: 'gpt-4o',
    });

    console.log('Azure OpenAI client initialized successfully');
    return client;
  } catch (error) {
    console.error('Error initializing Azure OpenAI client:', error);
    throw error;
  }
};

// Create a singleton instance of the client
let openAIClient;
try {
  openAIClient = initializeOpenAIClient();
} catch (error) {
  console.error('Failed to initialize Azure OpenAI client:', error);
}

// Export the client for potential direct usage in other services
export const getOpenAIClient = () => {
  if (!openAIClient) {
    openAIClient = initializeOpenAIClient();
  }
  return openAIClient;
};

export const generateSummaryWithAI = async (transcription, meetingType) => {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('Azure OpenAI client is not initialized');
  }

  try {
    const systemMessage =
      meetingType === 'legal'
        ? 'You are a legal professional specialising in transcription summarisation.'
        : 'You are a professional meeting summariser.';

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Please summarise the following ${meetingType} transcription: ${transcription}` },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
      timeout: 60000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary with Azure OpenAI:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

export default {
  getOpenAIClient,
  generateSummaryWithAI,
};
