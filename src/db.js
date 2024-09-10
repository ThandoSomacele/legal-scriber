import mongoose from 'mongoose';

const dbConnect = () => {
  // Azure Cosmos DB connection string (store this in your .env file)
  const connectionString = process.env.COSMOSDB_CONNECTION_STRING;

  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => console.log('Connected to Azure Cosmos DB'))
    .catch(err => console.error('Error connecting to Azure Cosmos DB:', err));
};

export default dbConnect;
