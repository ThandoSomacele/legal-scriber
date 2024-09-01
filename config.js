const config = {
  development: {
    apiUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3000'
  },
  production: {
    apiUrl: 'https://api.legalscriber.co.za',
    frontendUrl: 'https://legalscriber.co.za'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
