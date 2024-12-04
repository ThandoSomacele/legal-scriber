// scripts/verify-env.js
import logger from '../utils/logger.js';

export function loadAndCheckEnv() {
  // Required environment variables
  const requiredVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_ACCOUNT_NAME',
    'VITE_SPEECH_KEY',
    'VITE_SERVICE_REGION',
    'COSMOSDB_CONNECTION_STRING',
    'JWT_SECRET',
  ];

  // Check each required variable
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  // Log success
  console.log('✅ Environment variables loaded successfully');
  console.log('Current environment:', process.env.NODE_ENV);
}
