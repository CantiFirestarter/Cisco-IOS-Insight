import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injecting the API key specifically using string replacement for maximum reliability
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Standardizing process.env as an object for broader compatibility with third-party logic
    'process.env': {
      API_KEY: process.env.API_KEY,
    }
  },
  server: {
    port: 3000,
    host: true, // Enable accessibility from local network devices
  },
  build: {
    outDir: 'dist',
    target: 'esnext', // Target modern browsers to reduce polyfill weight
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000, // Account for heavy dashboard and visualization libraries
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', 'recharts'],
        },
      },
    },
  },
});