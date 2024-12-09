// scripts/verify-env.js
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import logger from '../src/utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function verifyEnv() {
  try {
    dotenv.config({ path: join(__dirname, '..', '.env') });
  } catch (err) {
    console.log('No .env file found, using environment variables');
  }

  // Core required variables for all environments
  const coreVars = ['JWT_SECRET', 'COSMOSDB_CONNECTION_STRING'];

  // Additional variables required only in production
  const productionVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_ACCOUNT_NAME',
    'VITE_SPEECH_KEY',
    'VITE_SERVICE_REGION',
    'AZURE_COMMUNICATION_CONNECTION_STRING',
  ];

  // Check required variables based on environment
  const requiredVars = process.env.NODE_ENV === 'production' ? [...coreVars, ...productionVars] : coreVars;

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });

    // Only exit in production; warn in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode with missing variables');
    }
  }

  console.log('✅ Environment variables verified successfully');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

verifyEnv();
