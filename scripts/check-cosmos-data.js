// scripts/check-cosmos-data.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Transcription from '../src/models/Transcription.js';
import Summary from '../src/models/Summary.js';
import Subscription from '../src/models/Subscription.js';

// Load environment variables
dotenv.config();

async function displayCollectionData(Model, modelName) {
  try {
    const count = await Model.countDocuments();
    console.log(`\n${modelName} Collection (Total: ${count})`);
    console.log('='.repeat(50));

    if (count > 0) {
      const documents = await Model.find().limit(5);
      documents.forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log(JSON.stringify(doc.toObject(), null, 2));
      });

      if (count > 5) {
        console.log(`\n... and ${count - 5} more documents`);
      }
    } else {
      console.log('No documents found in this collection');
    }
  } catch (error) {
    console.error(`Error fetching ${modelName} data:`, error);
  }
}

async function checkDatabase() {
  try {
    // Connect to database using existing configuration
    await mongoose.connect(process.env.COSMOSDB_CONNECTION_STRING, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      tls: true,
      retryWrites: false,
      authMechanism: 'SCRAM-SHA-256',
    });

    console.log('\nConnected to Cosmos DB successfully');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);

    // Display data from each collection
    await displayCollectionData(User, 'Users');
    await displayCollectionData(Transcription, 'Transcriptions');
    await displayCollectionData(Summary, 'Summaries');
    await displayCollectionData(Subscription, 'Subscriptions');

    // Display collections statistics
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable Collections:');
    console.log('-'.repeat(30));
    collections.forEach(collection => {
      console.log(collection.name);
    });

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the check
checkDatabase().catch(console.error);
