// src/services/transcriptionService.js

import Transcription from '../models/Transcription.js';
import { BlobServiceClient } from '@azure/storage-blob';
import { speechToText } from './azureSpeechService.js';

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.VITE_AUDIOS_CONTAINER_NAME);

export const uploadAndTranscribe = async (files, meetingType, userId) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for transcription');
    }

    const audioFileUrls = await Promise.all(files.map(uploadFile));

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

const uploadFile = async file => {
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(file.buffer, file.buffer.length);
  return blockBlobClient.url;
};

const processTranscription = async transcription => {
  try {
    transcription.status = 'processing';
    await transcription.save();

    const transcriptionTexts = await Promise.all(transcription.audioFileUrls.map(url => speechToText(url)));

    transcription.content = transcriptionTexts.join('\n\n');
    transcription.status = 'completed';
    await transcription.save();
  } catch (error) {
    console.error('Error processing transcription:', error);
    transcription.status = 'failed';
    await transcription.save();
  }
};
