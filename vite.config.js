// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        usePolling: true, // Enable polling for hot reload
        interval: 1000, // Check for changes every second
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // UI components chunk
            ui: ['lucide-react', 'recharts'],
            // Authentication related
            auth: ['jwt-decode', 'axios'],
            // Editor related
            editor: ['react-markdown', 'react-markdown-editor-lite'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
    },
    resolve: {
      alias: {
        crypto: 'crypto-js',
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['crypto'],
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
