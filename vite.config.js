import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  sserver: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' ? 'https://api.legalscriber.co.za' : 'http://localhost:3000'
    ),
  },
});
