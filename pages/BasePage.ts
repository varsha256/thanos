import { expect, type Locator, type Page } from '@playwright/test';
import { Timeouts } from '../config/timeouts';
import { Logger } from '../utils/Logger';

/**
 * Base page providing shared Playwright helpers.
 * Page Objects and Components extend this for consistent waits and interactions.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: Logger;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger ?? new Logger(this.constructor.name);
  }

  async navigateTo(path: string): Promise<void> {
    this.logger.info(`Navigating to ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: Timeouts.navigation });
  }

  async click(locator: Locator, description?: string): Promise<void> {
    this.logger.info(`Click: ${description ?? locator.toString()}`);
    await locator.waitFor({ state: 'visible', timeout: Timeouts.medium });
    await locator.click();
  }

  async fill(locator: Locator, value: string, description?: string): Promise<void> {
    this.logger.info(`Fill: ${description ?? locator.toString()}`);
    await locator.waitFor({ state: 'visible', timeout: Timeouts.medium });
    await locator.fill(value);
  }

  async clearAndFill(locator: Locator, value: string, description?: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: Timeouts.medium });
    await locator.clear();
    await this.fill(locator, value, description);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible', timeout: Timeouts.medium });
    return (await locator.innerText()).trim();
  }

  async isVisible(locator: Locator, timeout = Timeouts.short): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async waitForVisible(locator: Locator, timeout = Timeouts.medium): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(locator: Locator, timeout = Timeouts.medium): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async expectVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible({ timeout: Timeouts.medium });
  }

  async expectText(locator: Locator, expected: string | RegExp, message?: string): Promise<void> {
    await expect(locator, message).toHaveText(expected, { timeout: Timeouts.medium });
  }

  async takeScreenshot(): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true });
  }

  async getPageHtml(): Promise<string> {
    return this.page.content();
  }

  async getConsoleLogs(): Promise<string[]> {
    // Console messages collected via FailureHandler network listeners when attached.
    return [];
  }
}
