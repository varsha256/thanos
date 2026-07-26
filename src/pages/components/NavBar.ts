import { Locator, Page } from '@playwright/test';

/**
 * Reusable UI component. Components wrap a self-contained piece of the UI (nav bar,
 * modal, card, header) so multiple Page Objects can share them without duplication.
 */
export class NavBar {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('nav').first();
  }

  /** Click a top-level navigation link by its visible text. */
  async open(linkText: string): Promise<void> {
    await this.root.getByRole('link', { name: linkText }).first().click();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }
}
