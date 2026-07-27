import type { Locator, Page } from '@playwright/test';
import { Timeouts } from '../config/timeouts';
import { BasePage } from '../pages/BasePage';
import { Logger } from '../utils/Logger';

/**
 * Toast / snackbar notification widget.
 */
export class ToastComponent extends BasePage {
  private readonly toast: Locator;
  private readonly toastMessage: Locator;
  private readonly toastClose: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('Toast') ?? new Logger('Toast'));
    this.toast = page.getByTestId('toast');
    this.toastMessage = page.getByTestId('toast-message');
    this.toastClose = page.getByTestId('toast-close');
  }

  async waitForToast(expectedText?: string | RegExp): Promise<string> {
    await this.waitForVisible(this.toast, Timeouts.toast);
    const message = await this.getText(this.toastMessage);

    if (expectedText) {
      const matched =
        typeof expectedText === 'string'
          ? message.includes(expectedText)
          : expectedText.test(message);

      if (!matched) {
        throw new Error(
          `Toast message mismatch. Expected: ${String(expectedText)}, Actual: ${message}`,
        );
      }
    }

    this.logger.info('Toast displayed', { message });
    return message;
  }

  async dismiss(): Promise<void> {
    if (await this.isVisible(this.toastClose, Timeouts.short)) {
      await this.click(this.toastClose, 'Dismiss toast');
    }
  }

  async expectSuccess(contains = /success|added|applied|placed|confirmed/i): Promise<void> {
    await this.waitForToast(contains);
  }

  async expectError(contains = /error|failed|invalid/i): Promise<void> {
    await this.waitForToast(contains);
  }
}
