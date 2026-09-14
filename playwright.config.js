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
    // The whole suite predates the Direct Edit builder mode and assumes
    // Classic mode's UI (the form rail, its fields and buttons) is what's
    // on screen after navigating to /cv. Direct Edit is now the app's
    // default for a fresh visitor (see uiReducer.js's createInitialUiState),
    // so seed every test's localStorage with the pre-Direct-Edit default
    // to keep the existing suite's assumptions intact. e2e/direct-edit.spec.js's
    // own tests are unaffected either way — each one explicitly clicks the
    // "Direct Edit" tab itself rather than relying on whatever the default is.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:4173',
          localStorage: [{ name: 'portifycv-builder-mode', value: 'classic' }],
        },
      ],
    },
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
