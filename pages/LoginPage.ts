import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

/**
 * Authentication page — email/password login.
 * Contains UI interactions only; no business assertions beyond page readiness.
 */
export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMarker: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('LoginPage') ?? new Logger('LoginPage'));
    this.emailInput = page.getByTestId('login-email').or(page.getByLabel(/email|username/i));
    this.passwordInput = page.getByTestId('login-password').or(page.getByLabel(/password/i));
    this.submitButton = page.getByTestId('login-submit').or(
      page.getByRole('button', { name: /log ?in|sign ?in|submit/i }),
    );
    this.errorMessage = page.getByTestId('login-error').or(page.locator('#error'));
    this.successMarker = page.getByTestId('home-feed').or(
      page.getByRole('heading', { name: /welcome|home|restaurants/i }),
    );
  }

  async open(): Promise<void> {
    await this.navigateTo('/login');
  }

  async enterEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email, 'Email');
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password, 'Password');
  }

  async submit(): Promise<void> {
    await this.click(this.submitButton, 'Login submit');
  }

  async login(email: string, password: string): Promise<void> {
    this.logger.info('Performing login', { email });
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.submit();
    await this.waitForVisible(this.successMarker);
    this.logger.info('Login successful');
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return this.getText(this.errorMessage);
  }

  async isLoggedIn(): Promise<boolean> {
    return this.isVisible(this.successMarker);
  }
}
