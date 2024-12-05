// Import dependencies
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cron from 'node-cron';
import logger from './src/utils/logger.js';
import { setupCronJobs } from './src/services/cronService.js';
import { configureMiddleware } from './src/config/middleware.js';
import { setupRoutes } from './src/config/routes.js';
import envConfig from './envConfig.js';
import dbConnect from './src/db.js';

// Set up dirname for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize express application
const app = express();

// Load environment variables
try {
  dotenv.config();
} catch (error) {
  console.log('No .env file found, using environment variables');
}

// Connect to database
dbConnect();

// Configure middleware
configureMiddleware(app);

// Setup routes
setupRoutes(app);

// Setup cron jobs
setupCronJobs();

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/health', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const isOpenAIConfigured = !!process.env.AZURE_OPENAI_API_KEY;

    res.json({
      status: 'OK',
      services: {
        database: isMongoConnected ? 'connected' : 'disconnected',
        openai: isOpenAIConfigured ? 'configured' : 'not configured',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
});

// Database health check endpoint
app.get('/api/db-health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', message: 'Database connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API URL: ${envConfig.apiUrl}`);
});

// Global error handlers
process.on('unhandledRejection', error => {
  logger.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  // Exit process on uncaught exceptions
  process.exit(1);
});

export default app;
