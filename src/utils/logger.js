// src/utils/logger.js
import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create the logger
const logger = winston.createLogger({
  levels,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Production logging setup
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

// Add console logging for development only
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      level: 'debug',
    })
  );
}

// Utility functions for logging
export const logTranscriptionStatus = (
  transcriptionId,
  status,
  isProduction = process.env.NODE_ENV === 'production'
) => {
  if (isProduction) {
    // In production, only log important status changes
    if (status === 'completed' || status === 'failed' || status === 'error') {
      logger.info({
        event: 'transcription_status_change',
        transcriptionId,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    // In development, log all status changes
    logger.debug({
      event: 'transcription_status_change',
      transcriptionId,
      status,
      timestamp: new Date().toISOString(),
    });
  }
};

export const logError = (error, context) => {
  logger.error({
    event: 'error',
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
