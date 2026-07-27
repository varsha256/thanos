import type { Locator, Page } from '@playwright/test';
import type { ConfirmationDetails } from '../data/models/BookingData';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

/**
 * Order confirmation / success page.
 */
export class ConfirmationPage extends BasePage {
  private readonly successContainer: Locator;
  private readonly bookingId: Locator;
  private readonly bookingStatus: Locator;
  private readonly restaurantName: Locator;
  private readonly foodItem: Locator;
  private readonly totalPrice: Locator;
  private readonly couponDiscount: Locator;
  private readonly paymentMethod: Locator;
  private readonly viewOrdersButton: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('ConfirmationPage') ?? new Logger('ConfirmationPage'));
    this.successContainer = page.getByTestId('order-success').or(
      page.getByRole('heading', { name: /order (placed|confirmed)|booking (successful|confirmed)/i }),
    );
    this.bookingId = page.getByTestId('booking-id');
    this.bookingStatus = page.getByTestId('booking-status');
    this.restaurantName = page.getByTestId('confirmation-restaurant-name');
    this.foodItem = page.getByTestId('confirmation-food-item');
    this.totalPrice = page.getByTestId('confirmation-total');
    this.couponDiscount = page.getByTestId('confirmation-coupon-discount');
    this.paymentMethod = page.getByTestId('confirmation-payment-method');
    this.viewOrdersButton = page.getByRole('button', { name: /view orders|order history/i });
  }

  async waitForSuccess(): Promise<void> {
    await this.waitForVisible(this.successContainer);
    this.logger.info('Confirmation page is displayed');
  }

  async isDisplayed(): Promise<boolean> {
    return this.isVisible(this.successContainer);
  }

  async getBookingId(): Promise<string> {
    return this.getText(this.bookingId);
  }

  async getBookingStatus(): Promise<string> {
    return (await this.getText(this.bookingStatus)).toUpperCase();
  }

  async getDetails(): Promise<ConfirmationDetails> {
    const discountText = (await this.isVisible(this.couponDiscount))
      ? await this.getText(this.couponDiscount)
      : '0';

    return {
      bookingId: await this.getBookingId(),
      status: await this.getBookingStatus(),
      restaurantName: await this.getText(this.restaurantName),
      foodItem: await this.getText(this.foodItem),
      totalPrice: this.parseCurrency(await this.getText(this.totalPrice)),
      couponDiscount: this.parseCurrency(discountText),
      paymentMethod: await this.getText(this.paymentMethod),
      isConfirmationVisible: await this.isDisplayed(),
    };
  }

  async goToOrderHistory(): Promise<void> {
    await this.click(this.viewOrdersButton, 'View order history');
  }

  private parseCurrency(raw: string): number {
    const normalized = raw.replace(/[^0-9.-]/g, '');
    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value)) {
      throw new Error(`Unable to parse currency value from: "${raw}"`);
    }
    return Number(value.toFixed(2));
  }
}
