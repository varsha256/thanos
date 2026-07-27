import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from '../components/Header';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

/**
 * Order history page — verifies placed orders appear in history.
 */
export class OrderHistoryPage extends BasePage {
  readonly header: HeaderComponent;

  private readonly orderList: Locator;
  private readonly orderCards: Locator;
  private readonly emptyState: Locator;

  constructor(page: Page, logger?: Logger) {
    const pageLogger = logger?.child('OrderHistoryPage') ?? new Logger('OrderHistoryPage');
    super(page, pageLogger);
    this.header = new HeaderComponent(page, pageLogger);
    this.orderList = page.getByTestId('order-history-list');
    this.orderCards = page.getByTestId('order-card');
    this.emptyState = page.getByTestId('order-history-empty');
  }

  async open(): Promise<void> {
    await this.header.openOrderHistory();
    await this.waitForVisible(this.orderList);
  }

  async hasOrder(bookingId: string): Promise<boolean> {
    const card = this.orderCards.filter({ hasText: bookingId }).first();
    return this.isVisible(card);
  }

  async getOrderStatus(bookingId: string): Promise<string> {
    const card = this.orderCards.filter({ hasText: bookingId }).first();
    await this.waitForVisible(card);
    const status = card.getByTestId('order-status');
    return (await this.getText(status)).toUpperCase();
  }

  async getLatestBookingId(): Promise<string> {
    const firstCard = this.orderCards.first();
    await this.waitForVisible(firstCard);
    return this.getText(firstCard.getByTestId('order-booking-id'));
  }

  async isEmpty(): Promise<boolean> {
    return this.isVisible(this.emptyState);
  }
}
