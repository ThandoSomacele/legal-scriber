let envConfig = {
  development: {
    apiUrl: 'http://localhost:3000',
    frontendUrl: 'http://localhost:5173',
    transcriptionTimeout: 300000, // 5 minutes
  },
  production: {
    apiUrl: 'https://api.legalscriber.co.za',
    frontendUrl: 'https://legalscriber.co.za',
    transcriptionTimeout: 300000, // 5 minutes
  },
};

envConfig = envConfig[process.env.NODE_ENV || 'development'];

export default envConfig;
