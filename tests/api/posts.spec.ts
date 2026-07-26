import { test, expect } from '../../src/fixtures/fixtures';
import { newPostPayload } from '../../src/data/testData';

test.describe('Posts - API', { tag: '@api' }, () => {
  test('GET /posts/1 returns the expected post @smoke', async ({ postsClient }) => {
    const response = await postsClient.getPost(1);
    expect(response.ok()).toBeTruthy();

    const post = await response.json();
    expect(post).toMatchObject({ id: 1, userId: 1 });
    expect(post.title).toBeTruthy();
  });

  test('GET /posts returns a non-empty collection @regression', async ({ postsClient }) => {
    const response = await postsClient.listPosts();
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThan(0);
  });

  test('POST /posts creates a resource @smoke', async ({ postsClient }) => {
    const response = await postsClient.createPost(newPostPayload);
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created).toMatchObject(newPostPayload);
    expect(created.id).toBeDefined();
  });
});
