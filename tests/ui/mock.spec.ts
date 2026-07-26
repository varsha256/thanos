import { test, expect } from '../../src/fixtures/fixtures';
import { mockGetPost, mockedPost } from '../../src/mocks/postsMock';

test.describe('Network mocking - UI', { tag: '@ui' }, () => {
  test('serves a mocked API response to the browser @regression', async ({ page }) => {
    await mockGetPost(page);
    await page.goto('about:blank');

    const body = await page.evaluate(async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      return res.json();
    });

    expect(body.title).toBe(mockedPost.title);
    expect(body.userId).toBe(mockedPost.userId);
  });
});
