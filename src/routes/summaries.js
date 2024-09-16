import express from 'express';
import Summary from '../models/Summary.js';
import { generateSummary } from '../services/summaryService.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { transcriptionId, meetingType } = req.body;
    const userId = req.user.id; // Make sure this is coming from the auth middleware

    if (!transcriptionId || !meetingType) {
      return res.status(400).json({ message: 'TranscriptionId and meetingType are required' });
    }

    const summary = await generateSummary(transcriptionId, meetingType, userId);
    res.status(201).json({ summaryId: summary._id });
  } catch (error) {
    console.error('Error creating summary:', error);
    res.status(500).json({ message: 'Error creating summary', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Error fetching summary' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const summary = await Summary.findByIdAndUpdate(req.params.id, { content }, { new: true });
    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }
    res.json(summary);
  } catch (error) {
    console.error('Error updating summary:', error);
    res.status(500).json({ message: 'Error updating summary' });
  }
});

export default router;
