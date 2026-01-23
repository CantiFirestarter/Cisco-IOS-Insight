
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Cisco IOS Insight - Vite Configuration
 * 
 * Optimized for deployment on Cloudflare Workers with Assets.
 * This configuration handles the secure injection of the Gemini API key
 * and ensures that the build output is optimized for modern browsers.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    /**
     * Specifically inject the API_KEY from the build environment into the client-side code.
     * We avoid defining the entire 'process.env' object to prevent breaking 
     * internal Vite/React checks or other libraries that rely on standard env vars.
     */
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  server: {
    port: 3000,
    host: true, // Allow access from local network for mobile/tablet testing
  },
  build: {
    outDir: 'dist',
    target: 'esnext', // Target modern browsers to reduce polyfill overhead
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        /**
         * Organize code into logical chunks to improve caching and 
         * reduce the initial load time of the application.
         */
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', 'recharts'],
          markdown: ['react-markdown'],
        },
      },
    },
  },
});
