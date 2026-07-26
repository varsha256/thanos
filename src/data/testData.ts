import { NewPost } from '../api/clients/PostsClient';

/** Data-driven login scenarios (negative cases). Positive login uses secrets. */
export interface LoginScenario {
  name: string;
  username: string;
  password: string;
  expectedError: string;
  tag: '@smoke' | '@regression';
}

export const invalidLoginScenarios: LoginScenario[] = [
  {
    name: 'invalid username',
    username: 'incorrectUser',
    password: 'Password123',
    expectedError: 'Your username is invalid!',
    tag: '@smoke',
  },
  {
    name: 'invalid password',
    username: 'student',
    password: 'wrongPassword',
    expectedError: 'Your password is invalid!',
    tag: '@regression',
  },
];

export const newPostPayload: NewPost = {
  userId: 1,
  title: 'Playwright framework post',
  body: 'Created by the API test suite.',
};
