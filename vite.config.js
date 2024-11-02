// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(env.NODE_ENV),
        VITE_API_URL: JSON.stringify(
          env.NODE_ENV === 'production' ? 'https://api.legalscriber.co.za' : 'http://localhost:8000'
        ),
        VITE_SERVICE_REGION: JSON.stringify(env.VITE_SERVICE_REGION),
        VITE_SPEECH_KEY: JSON.stringify(env.VITE_SPEECH_KEY),
        VITE_SPEECH_ENDPOINT: JSON.stringify(env.VITE_SPEECH_ENDPOINT),
        VITE_AUDIOS_CONTAINER_NAME: JSON.stringify(env.VITE_AUDIOS_CONTAINER_NAME),
        VITE_PAYFAST_MERCHANT_ID: JSON.stringify(env.VITE_PAYFAST_MERCHANT_ID),
        VITE_PAYFAST_MERCHANT_KEY: JSON.stringify(env.VITE_PAYFAST_MERCHANT_KEY),
        VITE_PAYFAST_PASSPHRASE: JSON.stringify(env.VITE_PAYFAST_PASSPHRASE),
      },
    },
  };
});
