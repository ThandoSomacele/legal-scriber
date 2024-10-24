// scripts/test-db-connection.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);

dotenv.config();

async function validateConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    console.log('\nConnection String Analysis:');
    console.log('Protocol:', url.protocol);
    console.log('Host:', url.hostname);
    console.log('Parameters:', url.searchParams.toString());
    return true;
  } catch (error) {
    console.error('Invalid connection string format:', error.message);
    return false;
  }
}

async function checkDNSResolution(hostname) {
  try {
    console.log('\nChecking DNS resolution...');
    const records = await resolveSrv(`_mongodb._tcp.${hostname}`);
    console.log('DNS Records found:', records);
    return true;
  } catch (error) {
    console.error('DNS resolution failed:', error.message);
    return false;
  }
}

async function testConnection() {
  const connectionString = process.env.COSMOSDB_CONNECTION_STRING;

  if (!connectionString) {
    console.error('COSMOSDB_CONNECTION_STRING is not defined');
    process.exit(1);
  }

  console.log('Starting comprehensive connection test...');

  // Validate connection string
  const isValid = await validateConnectionString(connectionString);
  if (!isValid) {
    console.error('Connection string validation failed');
    process.exit(1);
  }

  // Extract hostname for DNS check
  const hostname = new URL(connectionString).hostname;
  await checkDNSResolution(hostname);

  // Simplified connection options
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    tls: true,
    retryWrites: false,
    authMechanism: 'SCRAM-SHA-256',
  };

  try {
    console.log('\nAttempting database connection...');

    await mongoose.connect(connectionString, options);

    console.log('\n✅ Successfully connected to database');
    console.log('Server:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);

    // Test database operation
    console.log('\nTesting database operation...');
    await mongoose.connection.db.admin().ping();
    console.log('Database ping successful');

    await mongoose.connection.close();
    console.log('Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.reason) {
      console.error('\nServer Description:');
      error.reason.servers.forEach((desc, address) => {
        console.error(`${address}:`, desc);
      });
    }

    process.exit(1);
  }
}

testConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
