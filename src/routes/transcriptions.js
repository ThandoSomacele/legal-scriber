import express from 'express';
import Transcription from '../models/Transcription.js';
import { uploadAndTranscribe } from '../services/transcriptionService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { files, meetingType } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    const transcription = await uploadAndTranscribe(files, meetingType, userId);
    res.status(201).json({ transcriptionId: transcription.id });
  } catch (error) {
    console.error('Error creating transcription:', error);
    res.status(500).json({ message: 'Error creating transcription' });
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
