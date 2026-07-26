import { APIRequestContext } from '@playwright/test';

/**
 * Base class for API clients. Each client wraps an `APIRequestContext` (created with a
 * baseURL + auth headers in the fixtures) and exposes typed, endpoint-specific methods.
 */
export abstract class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}
}
