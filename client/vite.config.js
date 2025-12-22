import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - MUST match your repository name
  // Repository: restaurant_management_system
  // URL: https://dipanrajbanshi01.github.io/restaurant_management_system/
  base: process.env.NODE_ENV === 'production' 
    ? `/${process.env.GITHUB_REPO_NAME || 'restaurant_management_system'}/`
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

