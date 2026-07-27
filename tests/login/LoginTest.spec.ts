import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { envConfig } from '../../config/env.config';

/**
 * Login smoke checks against the application under test.
 * Prefer checkout booking.spec.ts for full end-to-end coverage.
 */
test.describe('Login Tests @smoke @login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test('Verify successful login', async () => {
    await loginPage.login(envConfig.credentials.email, envConfig.credentials.password);
    expect(await loginPage.isLoggedIn()).toBe(true);
  });
});
