import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

export function loadAndCheckEnv() {
  // First, check if .env file exists
  const envPath = join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found in project root!');
    console.log(`Expected location: ${envPath}`);
    process.exit(1);
  }

  // Load .env file
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
    process.exit(1);
  }

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
