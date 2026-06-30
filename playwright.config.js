// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const isCI = !!process.env.CI;
const isIDX = !!(process.env.IDX_ENV || process.env.REPLIT_ENV);

// Detecta porta do servidor Next.js (3000 ou 3001)
function detectBaseURL() {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const http = require('http');
  try {
    const req = http.request({ hostname: 'localhost', port: 3000, method: 'HEAD', path: '/', timeout: 500 });
    req.on('response', () => { /* 3000 ok */ });
    req.on('error', () => { /* 3000 falhou */ });
    req.end();
    return 'http://localhost:3000';
  } catch {
    return 'http://localhost:3001';
  }
}

// Fallback simples: se 3000 não responde, usa 3001
const baseURL = process.env.BASE_URL || (isIDX ? 'http://localhost:3001' : 'http://localhost:3000');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: !isIDX,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isIDX ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          args: ['--no-sandbox'],
          firefoxUserPrefs: { 'security.sandbox.content.level': 0 },
        },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: {
          args: ['--no-sandbox'],
        },
      },
    },
  ],
});
