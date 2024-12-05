// src/config/middleware.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import envConfig from '../../envConfig.js';
import sanitizeQuery from './sanitizeQuery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const configureMiddleware = app => {
  app.use(sanitizeQuery);
  // CORS configuration
  app.use(
    cors({
      origin: envConfig.frontendUrl,
      credentials: true,
    })
  );

  // JSON body parser
  app.use(express.json({ limit: '10mb' }));

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });
};
