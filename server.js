// server.js
// At the top of server.js
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

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));

// Try loading .env but don't fail if not found
try {
  dotenv.config({ path: join(__dirname, '.env') });
} catch (err) {
  console.log('No .env file found, using environment variables');
}

// Verify required environment variables
const requiredVars = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'COSMOSDB_CONNECTION_STRING'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

const app = express();

// Connect to database
dbConnect();

// Configure middleware
configureMiddleware(app);

// Setup routes
setupRoutes(app);

// Setup cron jobs
setupCronJobs();

// Health check endpoints
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
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
});

app.get('/api/db-health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', message: 'Database connected' });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Start server
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API URL: ${envConfig.apiUrl}`);
});

// Error handling
process.on('unhandledRejection', error => {
  logger.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
