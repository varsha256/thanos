import { defineConfig, devices } from '@playwright/test';
import { getUiBaseURL, getApiBaseURL, STORAGE_STATE } from './config/environment';

/**
 * Playwright configuration.
 *
 * Projects:
 *  - `setup`         : authenticates once and stores browser state (dependency of UI).
 *  - `api`           : headless API tests against the API baseURL.
 *  - `ui-chromium`   : browser tests, reuse the authenticated storage state.
 *
 * Parallelism: `fullyParallel` runs tests within a file in parallel; multiple workers
 * run files in parallel. Filter suites with tags, e.g. `--grep @smoke`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: getUiBaseURL() },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: getApiBaseURL() },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: getUiBaseURL(),
        storageState: STORAGE_STATE,
      },
    },
  ],
});
