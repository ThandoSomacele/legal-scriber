// src/db.js
import mongoose from 'mongoose';

const dbConnect = async () => {
  const connectionString = process.env.COSMOSDB_CONNECTION_STRING;

  if (!connectionString) {
    console.error('COSMOSDB_CONNECTION_STRING is not defined');
    process.exit(1);
  }

  // Simplified options for Cosmos DB
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    tls: true,
    retryWrites: false,
    authMechanism: 'SCRAM-SHA-256',
  };

  try {
    console.log('Attempting to connect to Cosmos DB...');

    const conn = await mongoose.connect(connectionString, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => dbConnect(), 5000);
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });
  } catch (error) {
    console.error('Error connecting to database:', error);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('\nDetailed Connection Error Information:');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);

      if (error.reason) {
        console.error('\nServer Information:');
        error.reason.servers.forEach((desc, address) => {
          console.error(`Server ${address}:`, desc.error || 'No error details');
        });
      }
    }

    // Retry logic
    console.log('\nRetrying connection in 5 seconds...');
    setTimeout(() => dbConnect(), 5000);
  }
};

export default dbConnect;
