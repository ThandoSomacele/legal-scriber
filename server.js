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

// Verify required environment variables
const requiredEnvVars = [
  'AZURE_OPENAI_API_KEY',
  'AZURE_OPENAI_ENDPOINT',
  'COSMOSDB_CONNECTION_STRING',
  'JWT_SECRET',
  'NODE_ENV',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Load environment variables
try {
  dotenv.config();
  logger.info('Environment variables loaded successfully');
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API URL: ${envConfig.apiUrl}`);
} catch (error) {
  logger.warn('No .env file found, using environment variables');
}

// Enhanced database connection with retry logic
let dbConnected = false;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

const connectWithRetry = async (retryCount = 0) => {
  try {
    await dbConnect();
    dbConnected = true;
    logger.info('Successfully connected to database');
  } catch (error) {
    logger.error(`Database connection attempt ${retryCount + 1} failed:`, error);
    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      setTimeout(() => connectWithRetry(retryCount + 1), RETRY_INTERVAL);
    } else {
      logger.error('Max database connection retries reached. Exiting...');
      process.exit(1);
    }
  }
};

// Start database connection
connectWithRetry();

// Configure middleware with error handling
try {
  configureMiddleware(app);
  logger.info('Middleware configured successfully');
} catch (error) {
  logger.error('Failed to configure middleware:', error);
  process.exit(1);
}

// Setup routes with error handling
try {
  setupRoutes(app);
  logger.info('Routes configured successfully');
} catch (error) {
  logger.error('Failed to setup routes:', error);
  process.exit(1);
}

// Setup cron jobs with error handling
try {
  setupCronJobs();
  logger.info('Cron jobs configured successfully');
} catch (error) {
  logger.error('Failed to setup cron jobs:', error);
  // Don't exit for cron job failures
}

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  const status = dbStatus ? 'healthy' : 'degraded';
  const statusCode = dbStatus ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
  });
});

// Enhanced API health check
app.get('/api/health', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const isOpenAIConfigured = !!process.env.AZURE_OPENAI_API_KEY;

    const status = isMongoConnected && isOpenAIConfigured ? 'OK' : 'DEGRADED';
    const statusCode = status === 'OK' ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: isMongoConnected ? 'connected' : 'disconnected',
        openai: isOpenAIConfigured ? 'configured' : 'not configured',
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Application error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

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

// Enhanced server startup
const port = process.env.PORT || 8000;
let server;

const startServer = async () => {
  try {
    // Wait for database connection before starting server
    while (!dbConnected) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    server = app.listen(port, '0.0.0.0', () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: ${envConfig.apiUrl}`);
    });

    server.on('error', error => {
      logger.error('Server error:', error);
      process.exit(1);
    });

    // Add keep-alive settings
    server.keepAliveTimeout = 65000; // Slightly higher than Azure's 60 second timeout
    server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Enhanced graceful shutdown
const gracefulShutdown = async signal => {
  logger.info(`${signal} received. Performing graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000); // Force shutdown after 30 seconds

  try {
    if (server) {
      await new Promise(resolve => server.close(resolve));
      logger.info('Server closed');
    }

    if (mongoose.connection) {
      await mongoose.connection.close(false);
      logger.info('Database connections closed');
    }

    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Handle various shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;
