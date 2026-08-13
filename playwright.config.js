import { defineConfig, devices } from '@playwright/test'

// Runs against a production build (npm run build && npm run preview), not the
// dev server — the lazy-loaded CVPreview chunk, the idle PDF-bundle prefetch,
// and the manual vendor chunking in vite.config.js only behave the way a real
// user sees them once bundled, not under Vite's dev-server module graph.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
