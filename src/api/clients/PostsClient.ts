import { APIResponse } from '@playwright/test';
import { BaseApiClient } from '../BaseApiClient';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

/**
 * API client for the /posts resource (https://jsonplaceholder.typicode.com).
 */
export class PostsClient extends BaseApiClient {
  async getPost(id: number): Promise<APIResponse> {
    return this.request.get(`/posts/${id}`);
  }

  async listPosts(): Promise<APIResponse> {
    return this.request.get('/posts');
  }

  async createPost(post: NewPost): Promise<APIResponse> {
    return this.request.post('/posts', { data: post });
  }

  async deletePost(id: number): Promise<APIResponse> {
    return this.request.delete(`/posts/${id}`);
  }
}
