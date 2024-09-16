import express from 'express';
import Transcription from '../models/Transcription.js';
import { uploadAndTranscribe } from '../services/transcriptionService.js';
import auth from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, upload.array('files'), async (req, res) => {
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
    const transcription = await Transcription.findById(req.params.id);
    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }
    res.json(transcription);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ message: 'Error fetching transcription' });
  }
});

export default router;
