import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// During `vite dev`, proxy /api to the backend running on :10000.
// During `vite build`, output goes to ../backend/admin-dist so Express serves it.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:10000',
      '/uploads': 'http://localhost:10000',
    },
  },
  build: {
    outDir: path.resolve(__dirname, '..', 'backend', 'admin-dist'),
    emptyOutDir: true,
  },
});
