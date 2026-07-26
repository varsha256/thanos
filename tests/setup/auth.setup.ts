import fs from 'fs';
import path from 'path';
import { test as setup } from '../../src/fixtures/fixtures';
import { credentials } from '../../config/secrets';
import { STORAGE_STATE } from '../../config/environment';
import { logger } from '../../src/utils/logger';

/**
 * Authentication project. Runs once before the UI suite, logs in with secret-backed
 * credentials and persists the browser storage state so UI specs start authenticated
 * (no repeated logins => faster, more stable parallel runs).
 */
setup('authenticate', async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.login(credentials.username, credentials.password);
  await loginPage.expectLoggedIn();

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
  logger.info(`Saved authenticated storage state to ${STORAGE_STATE}`);
});
