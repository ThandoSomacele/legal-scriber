// scripts/verify-env.js
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function verifyEnv() {
  try {
    // Try loading .env but don't fail if not found in production
    dotenv.config({ path: join(__dirname, '..', '.env') });
  } catch (err) {
    console.log('No .env file found, using environment variables');
  }

  // List of required environment variables
  const requiredVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_ACCOUNT_NAME',
    'VITE_SPEECH_KEY',
    'VITE_SERVICE_REGION',
    'COSMOSDB_CONNECTION_STRING',
    'JWT_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  console.log('✅ Environment variables verified successfully');
}

verifyEnv();
