import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './config/env.config';

/**
 * Enterprise Playwright configuration for checkout automation.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  reporter: process.env.CI
    ? [
        ['blob'],
        ['list'],
        ['json', { outputFile: 'artifacts/test-results.json' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'artifacts/test-results.json' }],
      ],
  use: {
    baseURL: envConfig.baseUrl,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: envConfig.defaultTimeoutMs,
    navigationTimeout: envConfig.navigationTimeoutMs,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'X-Test-Environment': envConfig.name,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
