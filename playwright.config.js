import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:8080',
    viewport: { width: 1200, height: 800 },
  },
  reporter: [['line'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
});
