import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // �til para despliegues en subdirectorios (como GitHub Pages)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true, // abre el navegador autom�ticamente
    host: 'localhost'
  },
  define: {
    'process.env': {}
  }
});
