// src/services/cronService.js
import cron from 'node-cron';
import logger from '../utils/logger.js';
import Transcription from '../models/Transcription.js';
import { checkAndUpdateTranscriptionStatus } from './transcriptionService.js';

export const setupCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    logger.info({
      event: 'cron_job_start',
      job: 'transcription_status_check',
      timestamp: new Date().toISOString(),
    });

    try {
      const pendingTranscriptions = await Transcription.find({
        status: { $in: ['pending', 'processing', 'submitted'] },
        transcriptionUrl: { $exists: true, $ne: null },
      });

      if (pendingTranscriptions.length > 0) {
        logger.info({
          event: 'pending_transcriptions_found',
          count: pendingTranscriptions.length,
        });
      }

      for (const transcription of pendingTranscriptions) {
        await checkAndUpdateTranscriptionStatus(transcription);
      }
    } catch (error) {
      logger.error('Error in transcription status check cron job:', error);
    }
  });
};
