import { Page } from '@playwright/test';

/**
 * Base class for all Page Objects. Holds the Playwright `page` handle and common helpers.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to the configured `baseURL`. */
  async goto(path = ''): Promise<void> {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
