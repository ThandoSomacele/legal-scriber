import mongoose from 'mongoose';

const dbConnect = () => {
  // Azure Cosmos DB connection string (store this in your .env file)
  const connectionString = process.env.COSMOSDB_CONNECTION_STRING;

  mongoose
    .connect(connectionString)
    .then(() => console.log('Connected to Azure Cosmos DB'))
    .catch(err => console.error('Error connecting to database:', err));
};

export default dbConnect;
