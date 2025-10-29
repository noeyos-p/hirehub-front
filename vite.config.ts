import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // 추가

export default defineConfig({
  plugins: [
    react(),
    // Node.js polyfill (global, process, Buffer 등 자동 주입)
    nodePolyfills({
      // global, process, Buffer 모두 포함
      globals: {
        global: true,
        process: true,
        Buffer: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});