let envConfig = {
  development: {
    apiUrl: 'http://localhost:8000',
    frontendUrl: 'http://localhost:5173',
  },
  production: {
    apiUrl: 'https://api.legalscriber.co.za',
    frontendUrl: 'https://legalscriber.co.za',
  },
};

envConfig = envConfig[process.env.NODE_ENV || 'development'];

export default envConfig;
