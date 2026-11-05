import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { normalizeBasePath } from './src/shared/config/basePath.ts';
export default defineConfig(({mode}) => ({
  plugins: [react(), tailwindcss()],
  base: normalizeBasePath(loadEnv(mode, process.cwd(), '').VITE_BASE_PATH || '/'),
  server: { port: 5173, allowedHosts: loadEnv(mode, process.cwd(), '').VITE_PREVIEW_HOST ? [loadEnv(mode, process.cwd(), '').VITE_PREVIEW_HOST] : [] },
}));
