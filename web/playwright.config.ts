import { defineConfig } from '@playwright/test';
const base = process.env.VITE_BASE_PATH || '/';
export default defineConfig({
 testDir: './e2e',
 use: { baseURL: `http://127.0.0.1:4175${base}`, screenshot:'only-on-failure' },
 projects: [
  { name:'desktop-1920', use:{viewport:{width:1920,height:1080}} },
  { name:'desktop-1440', use:{viewport:{width:1440,height:900}} },
 ],
 webServer: { command:'npm run preview -- --host 127.0.0.1 --port 4175', url:`http://127.0.0.1:4175${base}`, reuseExistingServer:false },
});
