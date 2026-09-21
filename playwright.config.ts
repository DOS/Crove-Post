import { defineConfig, devices } from '@playwright/test';

// Smoke E2E for Crove Post (minimal batch 2026-09-21).
// The unauthenticated checks always run. The authenticated flow
// (compose -> schedule -> calendar) only runs when E2E_DOS_EMAIL and
// E2E_DOS_PASSWORD are provided, because beta sign-in is gated by DOS ID SSO.
const baseURL = process.env.E2E_BASE_URL || 'https://beta-post.crove.com';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // E2E_BROWSER_CHANNEL=msedge|chrome lets a machine run on a system
        // browser when the managed chromium build has not been downloaded.
        ...(process.env.E2E_BROWSER_CHANNEL
          ? { channel: process.env.E2E_BROWSER_CHANNEL }
          : {}),
      },
    },
  ],
});
