import { Page } from '@playwright/test';
import { Post } from '../api/clients/PostsClient';

export const mockedPost: Post = {
  userId: 99,
  id: 1,
  title: 'Mocked Post Title',
  body: 'This response was served by a Playwright route mock, not the real API.',
};

/**
 * Intercept the GET /posts/1 network call in the browser context and fulfil it with a
 * deterministic mock. The CORS header lets cross-origin fetch() calls read the body.
 */
export async function mockGetPost(page: Page, post: Post = mockedPost): Promise<void> {
  await page.route('**/posts/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(post),
    });
  });
}
