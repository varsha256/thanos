import { test as base, expect, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PostsClient } from '../api/clients/PostsClient';
import { getApiBaseURL } from '../../config/environment';
import { apiToken } from '../../config/secrets';

/**
 * Custom fixtures. Import `test`/`expect` from this file instead of `@playwright/test`
 * so every spec gets ready-to-use Page Objects and API clients with zero boilerplate.
 */
type Fixtures = {
  loginPage: LoginPage;
};

type ApiFixtures = {
  apiContext: APIRequestContext;
  postsClient: PostsClient;
};

export const test = base.extend<Fixtures & ApiFixtures>({
  // --- UI fixtures ---
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // --- API fixtures ---
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: getApiBaseURL(),
      extraHTTPHeaders: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
    });
    await use(context);
    await context.dispose();
  },

  postsClient: async ({ apiContext }, use) => {
    await use(new PostsClient(apiContext));
  },
});

export { expect };
