import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (update this to match your repository name)
  // For root domain deployment, use '/'
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.GITHUB_REPO_NAME ? `/${process.env.GITHUB_REPO_NAME}/` : '/')
    : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

