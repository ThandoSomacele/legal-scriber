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

export const uploadAndTranscribe = async (files, meetingType, userId) => {
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

    const transcription = new Transcription({
      user: userId,
      meetingType,
      audioFileUrls,
      status: 'pending',
    });

    await transcription.save();

    // Start transcription process asynchronously
    processTranscription(transcription);

    return transcription;
  } catch (error) {
    console.error('Error in uploadAndTranscribe:', error);
    throw error;
  }
};

const processTranscription = async transcription => {
  try {
    console.log(`Starting transcription process for ${transcription._id}`);
    transcription.status = 'processing';
    await transcription.save();

    const transcriptionApiUrl = `https://${process.env.VITE_SERVICE_REGION}.api.cognitive.microsoft.com/speechtotext/v3.2/transcriptions`;

    const requestBody = {
      contentUrls: transcription.audioFileUrls,
      properties: {
        diarizationEnabled: true,
        wordLevelTimestampsEnabled: true,
        punctuationMode: 'DictatedAndAutomatic',
        profanityFilterMode: 'Masked',
      },
      locale: 'en-GB',
      displayName: `Transcription_${transcription.meetingType}_${Date.now()}`,
    };

    console.log('Sending request to Azure Speech Service:', JSON.stringify(requestBody, null, 2));

    const transcriptionResponse = await axios.post(transcriptionApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    console.log('Received response from Azure Speech Service:', JSON.stringify(transcriptionResponse.data, null, 2));

    transcription.transcriptionUrl = transcriptionResponse.data.self;
    transcription.status = 'submitted';
    await transcription.save();

    console.log(`Transcription ${transcription._id} submitted successfully`);
  } catch (error) {
    console.error('Error processing transcription:', error);
    console.error('Error details:', error.response?.data);
    transcription.status = 'failed';
    transcription.errorDetails = error.response?.data?.error?.message || error.message || 'Unknown error occurred';
    await transcription.save();
  }
};
