// transcriptionService.js
import logger, { logTranscriptionStatus, logError } from '../utils/logger.js';
import Transcription from '../models/Transcription.js';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import axios from 'axios';

const generateSasUrl = blobName => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_KEY
  );

  const blobSAS = generateBlobSASQueryParameters(
    {
      containerName: process.env.VITE_AUDIOS_CONTAINER_NAME,
      blobName: blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour from now
    },
    sharedKeyCredential
  ).toString();

  return `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.VITE_AUDIOS_CONTAINER_NAME}/${blobName}?${blobSAS}`;
};

const uploadAndTranscribe = async (files, meetingType, userId) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for transcription');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(process.env.VITE_AUDIOS_CONTAINER_NAME);

    const audioFileUrls = await Promise.all(
      files.map(async file => {
        const blobName = `${Date.now()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(file.buffer, file.buffer.length);
        return generateSasUrl(blobName);
      })
    );

    const transcriptionApiUrl = `https://${process.env.VITE_SERVICE_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;

    const requestBody = {
      contentUrls: audioFileUrls,
      properties: {
        diarizationEnabled: true,
        wordLevelTimestampsEnabled: true,
        punctuationMode: 'DictatedAndAutomatic',
        profanityFilterMode: 'Masked',
      },
      locale: 'en-GB',
      displayName: `Transcription_${meetingType}_${Date.now()}`,
    };

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    const transcription = new Transcription({
      user: userId,
      meetingType,
      audioFileUrls,
      status: 'submitted',
      transcriptionUrl: transcriptionResponse.data.self,
    });

    await transcription.save();
    logger.info(`Transcription ${transcription._id} submitted successfully`);
    return transcription;
  } catch (error) {
    logger.error('Error in uploadAndTranscribe:', error);
    throw error;
  }
};

// Make updateTranscriptionStatus exportable
export const updateTranscriptionStatus = async (transcription, status, azureResponse = null) => {
  try {
    if (status === 'completed' && azureResponse) {
      const filesResponse = await axios.get(azureResponse.data.links.files, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
        },
      });

      const files = filesResponse.data.values;
      const transcriptionFiles = files.filter(file => file.kind === 'Transcription');

      if (!transcriptionFiles || transcriptionFiles.length === 0) {
        throw new Error('No transcription files found');
      }

      const contents = await Promise.all(
        transcriptionFiles.map(async file => {
          const contentResponse = await axios.get(file.links.contentUrl, {
            headers: {
              'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
            },
          });
          return JSON.stringify(contentResponse.data);
        })
      );

      transcription.content = contents;
      transcription.completedAt = new Date();
    }

    transcription.status = status;
    await transcription.save();

    logger.info(`Updated transcription ${transcription._id} status to ${status}`);
  } catch (error) {
    logger.error(`Error updating transcription status:`, error);
    throw error;
  }
};

// Rename to match the import in cronService
const checkAndUpdateTranscriptionStatus = async transcription => {
  try {
    logTranscriptionStatus(transcription._id, transcription.status);

    if (!transcription.transcriptionUrl) {
      const error = new Error('Transcription URL is missing');
      logError(error, {
        transcriptionId: transcription._id,
      });
      await updateTranscriptionStatus(transcription, 'error');
      return 'error';
    }

    const response = await axios.get(transcription.transcriptionUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    const azureStatus = response.data.status;
    let status;

    // Map Azure status to our application status
    switch (azureStatus) {
      case 'NotStarted':
        status = 'pending';
        break;
      case 'Running':
        status = 'processing';
        break;
      case 'Succeeded':
        status = 'completed';
        break;
      case 'Failed':
        status = 'failed';
        break;
      default:
        status = 'error';
    }

    await updateTranscriptionStatus(transcription, status, response);
    return status;
  } catch (error) {
    logError(error, {
      transcriptionId: transcription._id,
      action: 'check_status',
    });
    await updateTranscriptionStatus(transcription, 'error');
    return 'error';
  }
};

export { uploadAndTranscribe, checkAndUpdateTranscriptionStatus };
