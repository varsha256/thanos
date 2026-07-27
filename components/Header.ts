import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { Logger } from '../utils/Logger';

/**
 * Global application header widget.
 */
export class HeaderComponent extends BasePage {
  private readonly cartButton: Locator;
  private readonly cartBadge: Locator;
  private readonly profileMenu: Locator;
  private readonly ordersLink: Locator;
  private readonly logoutButton: Locator;
  private readonly locationButton: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('Header') ?? new Logger('Header'));
    this.cartButton = page.getByTestId('header-cart-button');
    this.cartBadge = page.getByTestId('header-cart-badge');
    this.profileMenu = page.getByTestId('header-profile-menu');
    this.ordersLink = page.getByRole('link', { name: /order history|my orders/i });
    this.logoutButton = page.getByRole('button', { name: /log ?out|sign ?out/i });
    this.locationButton = page.getByTestId('header-location-button');
  }

  async openCart(): Promise<void> {
    await this.click(this.cartButton, 'Header cart');
  }

  async openOrderHistory(): Promise<void> {
    await this.click(this.profileMenu, 'Profile menu');
    await this.click(this.ordersLink, 'Order history link');
  }

  async openLocationPicker(): Promise<void> {
    await this.click(this.locationButton, 'Location picker');
  }

  async getCartCount(): Promise<number> {
    if (!(await this.isVisible(this.cartBadge))) {
      return 0;
    }
    const text = await this.getText(this.cartBadge);
    const count = Number.parseInt(text.replace(/\D/g, ''), 10);
    return Number.isNaN(count) ? 0 : count;
  }

  async logout(): Promise<void> {
    await this.click(this.profileMenu, 'Profile menu');
    await this.click(this.logoutButton, 'Logout');
  }
}
