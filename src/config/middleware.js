// src/config/middleware.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import envConfig from '../../envConfig.js';
import sanitizeQuery from '../middleware/sanitizeQuery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const configureMiddleware = app => {
  // Trust proxy setup - Add this before other middleware
  if (process.env.NODE_ENV === 'production') {
    // Trust first proxy in production
    app.set('trust proxy', 1);
  } else {
    // Trust all proxies in development
    app.set('trust proxy', true);
  }

  // Apply sanitization middleware
  app.use(sanitizeQuery);

  // CORS configuration
  app.use(
    cors({
      origin: envConfig.frontendUrl,
      credentials: true,
    })
  );

  // JSON body parser with size limit
  app.use(express.json({ limit: '10mb' }));

  // Static file serving for production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });
};
