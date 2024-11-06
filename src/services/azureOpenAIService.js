// src/services/azureOpenAIService.js
import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes the Azure OpenAI client
 * @returns {AzureOpenAI} The configured client
 */
const initializeOpenAIClient = () => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const deploymentId = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;

  // Debug logging
  console.log('Azure OpenAI Configuration:');
  console.log('Endpoint:', endpoint);
  console.log('API Version:', apiVersion);
  console.log('Deployment ID:', deploymentId);

  if (!apiKey || !endpoint || !apiVersion || !deploymentId) {
    throw new Error(
      `Missing Azure OpenAI configuration:\n${!apiKey ? '- API Key missing\n' : ''}${
        !endpoint ? '- Endpoint missing\n' : ''
      }${!apiVersion ? '- API Version missing\n' : ''}${!deploymentId ? '- Deployment ID missing\n' : ''}`
    );
  }

  try {
    return new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion,
    });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    throw error;
  }
};

// Create singleton instance
let openAIClient;
try {
  openAIClient = initializeOpenAIClient();
} catch (error) {
  console.error('Failed to initialize Azure OpenAI client:', error);
}

/**
 * Generates an AI summary of the provided transcription
 * @param {string} transcriptionText - Text to summarize
 * @param {string} meetingType - Type of meeting
 * @returns {Promise<string>} Generated summary
 */
export const generateSummaryWithAI = async (transcriptionText, meetingType) => {
  if (!openAIClient) {
    throw new Error('Azure OpenAI client is not initialized');
  }

  const deploymentId = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  console.log('Attempting summary with deployment:', deploymentId);

  try {
    const completion = await openAIClient.chat.completions.create({
      model: deploymentId,
      messages: [
        {
          role: 'system',
          content:
            meetingType === 'legal'
              ? 'You are a legal professional summarizing legal proceedings. Provide clear, structured summaries that highlight key legal points, arguments, decisions, and maintain formal legal language.'
              : 'You are a professional meeting summarizer. Create clear, structured summaries that highlight key discussion points, decisions made, action items, and use clear business language.',
        },
        {
          role: 'user',
          content: `Please provide a comprehensive summary of the following ${meetingType} transcription:\n\n${transcriptionText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      top_p: 0.95,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    console.log('Summary generation completed successfully');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Azure OpenAI Error Details:', {
      error,
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      deploymentUsed: deploymentId,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    });

    // Enhanced error handling
    if (error.status === 404) {
      throw new Error(
        `Azure OpenAI deployment '${deploymentId}' not found. Please verify the deployment name and ensure it is active.`
      );
    } else if (error.status === 401) {
      throw new Error('Authentication failed. Please check your Azure OpenAI API key.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    throw error;
  }
};

export default {
  getOpenAIClient: () => openAIClient,
  generateSummaryWithAI,
};
