// scripts/test-env.js
import { loadAndCheckEnv } from '../src/utils/envChecker.js';

loadAndCheckEnv();

// Test specific variables
console.log('\nTesting specific variables:');
console.log('OpenAI API Key:', process.env.AZURE_OPENAI_API_KEY ? '✓ Set' : '✗ Not set');
console.log('Cosmos DB Connection:', process.env.COSMOSDB_CONNECTION_STRING ? '✓ Set' : '✗ Not set');
