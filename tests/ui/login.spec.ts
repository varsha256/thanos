import { test, expect } from '../../src/fixtures/fixtures';
import { credentials } from '../../config/secrets';
import { invalidLoginScenarios } from '../../src/data/testData';

test.describe('Login - UI', { tag: '@ui' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('successful login @smoke', async ({ loginPage }) => {
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectLoggedIn();
  });

  // Data-driven: one test per scenario in the test-data config.
  for (const scenario of invalidLoginScenarios) {
    test(`failed login - ${scenario.name} ${scenario.tag}`, async ({ loginPage }) => {
      await loginPage.login(scenario.username, scenario.password);
      await loginPage.expectError(scenario.expectedError);
    });
  }
});
