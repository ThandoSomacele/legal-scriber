// src/routes/transcriptions.js
import express from 'express';
import multer from 'multer';
import logger from '../utils/logger.js';
import { uploadAndTranscribe, checkAndUpdateTranscriptionStatus } from '../services/transcriptionService.js';
import Transcription from '../models/Transcription.js';
import auth from '../middleware/auth.js';
import checkSubscription from '../middleware/checkSubscription.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload and create new transcription
router.post('/', [auth, checkSubscription], upload.array('files'), async (req, res) => {
  const { subscription } = req;
  logger.info('Starting new transcription request');

  try {
    const { meetingType } = req.body;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      logger.warn('Transcription request received with no files');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    logger.info(`Processing ${req.files.length} files for ${meetingType} transcription`);

    const transcription = await uploadAndTranscribe(req.files, meetingType, userId);

    logger.info(`Transcription created successfully with ID: ${transcription._id}`);

    res.status(201).json({
      transcriptionId: transcription._id,
      transcriptionUrl: transcription.transcriptionUrl,
      meetingType: transcription.meetingType,
    });
  } catch (error) {
    logger.error('Error creating transcription:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      meetingType: req.body.meetingType,
    });

    res.status(500).json({
      error: 'An error occurred during transcription',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// Get transcription by ID
router.get('/:id', auth, async (req, res) => {
  const transcriptionId = req.params.id;
  logger.info(`Fetching transcription: ${transcriptionId}`);

  try {
    const transcription = await Transcription.findById(transcriptionId);

    if (!transcription) {
      logger.warn(`Transcription not found: ${transcriptionId}`);
      return res.status(404).json({ message: 'Transcription not found' });
    }

    // Check if user has permission to access this transcription
    if (transcription.user.toString() !== req.user.id) {
      logger.warn(`Unauthorized access attempt to transcription: ${transcriptionId}`);
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Check and update status if needed
    if (['processing', 'submitted'].includes(transcription.status)) {
      logger.info(`Checking status for transcription: ${transcriptionId}`);

      try {
        const updatedStatus = await checkAndUpdateTranscriptionStatus(transcription);
        transcription.status = updatedStatus;
        await transcription.save();

        logger.info(`Updated transcription status to: ${updatedStatus}`);
      } catch (statusError) {
        logger.error('Error checking transcription status:', {
          transcriptionId,
          error: statusError.message,
          stack: statusError.stack,
        });
        // Don't throw here, return the transcription with its current status
      }
    }

    res.json(transcription);
  } catch (error) {
    logger.error('Error fetching transcription:', {
      transcriptionId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'Failed to fetch transcription',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// Get all transcriptions for a user
router.get('/', auth, async (req, res) => {
  logger.info(`Fetching all transcriptions for user: ${req.user.id}`);

  try {
    const transcriptions = await Transcription.find({ user: req.user.id }).sort({ createdAt: -1 }); // Most recent first

    logger.info(`Found ${transcriptions.length} transcriptions`);
    res.json(transcriptions);
  } catch (error) {
    logger.error('Error fetching transcriptions:', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'Failed to fetch transcriptions',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// Delete transcription
router.delete('/:id', auth, async (req, res) => {
  const transcriptionId = req.params.id;
  logger.info(`Delete request for transcription: ${transcriptionId}`);

  try {
    const transcription = await Transcription.findById(transcriptionId);

    if (!transcription) {
      logger.warn(`Transcription not found for deletion: ${transcriptionId}`);
      return res.status(404).json({ message: 'Transcription not found' });
    }

    // Check if user has permission to delete this transcription
    if (transcription.user.toString() !== req.user.id) {
      logger.warn(`Unauthorized deletion attempt for transcription: ${transcriptionId}`);
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await transcription.remove();
    logger.info(`Transcription deleted successfully: ${transcriptionId}`);

    res.json({ message: 'Transcription deleted successfully' });
  } catch (error) {
    logger.error('Error deleting transcription:', {
      transcriptionId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'Failed to delete transcription',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

export default router;
