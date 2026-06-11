import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 60000,
  retries: 2,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  webServer: {
    command: 'npx next start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    cwd: '..',
    timeout: 30000,
    env: {
      ...(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ? { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }
        : {}),
      ...(process.env.CLERK_SECRET_KEY ? { CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY } : {})
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
});
