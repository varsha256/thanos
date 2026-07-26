import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavBar } from './components/NavBar';

/**
 * Page Object for the practice login page.
 * https://practicetestautomation.com/practice-test-login/
 */
export class LoginPage extends BasePage {
  readonly navBar: NavBar;
  readonly username: Locator;
  readonly password: Locator;
  readonly submitBtn: Locator;
  readonly errorMessage: Locator;
  readonly successHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.navBar = new NavBar(page);
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.submitBtn = page.locator('#submit');
    this.errorMessage = page.locator('#error');
    this.successHeading = page.locator('.post-title');
  }

  async open(): Promise<void> {
    await this.goto('/practice-test-login/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitBtn.click();
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/logged-in-successfully/);
    await expect(this.successHeading).toHaveText('Logged In Successfully');
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
