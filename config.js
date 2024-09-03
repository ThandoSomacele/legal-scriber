const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    frontendUrl: 'http://localhost:5173',
  },
  production: {
    apiUrl: 'https://api.legalscriber.co.za',
    frontendUrl: 'https://legalscriber.co.za',
  },
};

const env = process.env.NODE_ENV || 'development';
export default config[env];
