// scripts/verify-env.js
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

console.log('Checking environment configuration...');
console.log('Environment file path:', envPath);

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

// Load environment variables
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
  process.exit(1);
}

// Define required variables
const requiredVars = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'COSMOSDB_CONNECTION_STRING'];

// Check each variable
let hasErrors = false;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required variable: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
