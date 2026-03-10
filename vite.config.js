import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3002',
        ws: true
      }
    }
  }
});
