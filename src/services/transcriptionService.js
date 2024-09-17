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
      transcriptionUrl: transcriptionResponse.data.self, // Save the transcription URL
    });

    await transcription.save();

    console.log(`Transcription ${transcription._id} submitted successfully`);
    return transcription;
  } catch (error) {
    console.error('Error in uploadAndTranscribe:', error);
    throw error;
  }
};

export const checkTranscriptionStatus = async transcription => {
  try {
    console.log(`Checking status for transcription: ${transcription._id}`);

    if (!transcription.transcriptionUrl) {
      console.error(`Transcription URL is undefined for transcription: ${transcription._id}`);
      transcription.status = 'error';
      transcription.errorDetails = 'Transcription URL is missing';
      await transcription.save();
      return 'error';
    }

    console.log(`Transcription URL: ${transcription.transcriptionUrl}`);

    const response = await axios.get(transcription.transcriptionUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
      },
    });

    // console.log(`Azure response:`, response.data);

    const status = response.data.status;
    console.log(`Transcription ${transcription._id} status:`, status);

    if (status === 'Succeeded') {
      console.log(`Transcription ${transcription._id} succeeded, fetching files`);
      // Fetch the transcription files
      const filesResponse = await axios.get(response.data.links.files, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.VITE_SPEECH_KEY,
        },
      });

      // console.log(`Files response:`, filesResponse.data);

      const transcriptionFiles = filesResponse.data.values.filter(file => file.kind === 'Transcription');
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
      transcription.status = 'completed';
      transcription.completedAt = new Date();
    } else if (status === 'Failed') {
      transcription.status = 'failed';
      transcription.errorDetails = 'Transcription failed on Azure service';
    } else {
      transcription.status = 'processing';
    }

    await transcription.save();
    console.log(`Updated transcription ${transcription._id} status: ${transcription.status}`);
    return transcription.status;
  } catch (error) {
    console.error('Error checking transcription status:', error);
    console.error('Error details:', error.response?.data);
    transcription.status = 'error';
    transcription.errorDetails = `Error checking transcription status: ${error.message}`;
    await transcription.save();
    return 'error';
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
