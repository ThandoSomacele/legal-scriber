import express from 'express';
import Transcription from '../models/Transcription.js';
import { uploadAndTranscribe, checkTranscriptionStatus } from '../services/transcriptionService.js';
import auth from '../middleware/auth.js';
import checkSubscription from '../middleware/checkSubscription.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', [auth, checkSubscription], upload.array('files'), async (req, res) => {
  // Check usage limits TODO
  const { subscription } = req;

  try {
    const { meetingType } = req.body;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const transcription = await uploadAndTranscribe(req.files, meetingType, userId);
    res.status(201).json({ transcriptionId: transcription.id, transcriptionUrl: transcription.transcriptionUrl });
  } catch (error) {
    console.error('Error creating transcription:', error);
    res.status(500).json({ message: 'Error creating transcription', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching transcription with ID: ${req.params.id}`);
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      console.log(`Transcription not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Transcription not found' });
    }

    // console.log(`Found transcription: ${JSON.stringify(transcription)}`);

    // If the transcription is still processing or submitted, check its status
    if (transcription.status === 'processing' || transcription.status === 'submitted') {
      console.log(`Checking status for transcription: ${transcription._id}`);
      try {
        const updatedStatus = await checkTranscriptionStatus(transcription);
        transcription.status = updatedStatus;
        await transcription.save();
        console.log(`Updated transcription status: ${updatedStatus}`);
      } catch (statusError) {
        console.error('Error checking transcription status:', statusError);
        // Don't throw here, just log the error and continue
      }
    }

    res.json(transcription);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ message: 'Error fetching transcription', error: error.message, stack: error.stack });
  }
});

export default router;
