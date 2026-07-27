import type { Locator, Page } from '@playwright/test';
import type { PaymentData } from '../data/models/BookingData';
import { BasePage } from '../pages/BasePage';
import { Logger } from '../utils/Logger';

/**
 * Payment method selection modal.
 */
export class PaymentModalComponent extends BasePage {
  private readonly modal: Locator;
  private readonly walletOption: Locator;
  private readonly cardOption: Locator;
  private readonly codOption: Locator;
  private readonly upiOption: Locator;
  private readonly walletBalance: Locator;
  private readonly confirmPaymentButton: Locator;
  private readonly paymentSuccessIndicator: Locator;
  private readonly closeButton: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('PaymentModal') ?? new Logger('PaymentModal'));
    this.modal = page.getByTestId('payment-modal');
    this.walletOption = page.getByTestId('payment-method-wallet');
    this.cardOption = page.getByTestId('payment-method-card');
    this.codOption = page.getByTestId('payment-method-cod');
    this.upiOption = page.getByTestId('payment-method-upi');
    this.walletBalance = page.getByTestId('wallet-balance');
    this.confirmPaymentButton = page.getByRole('button', {
      name: /pay|confirm payment|place order/i,
    });
    this.paymentSuccessIndicator = page.getByTestId('payment-success');
    this.closeButton = page.getByTestId('payment-modal-close');
  }

  async waitUntilOpen(): Promise<void> {
    await this.waitForVisible(this.modal);
  }

  async selectPaymentMethod(payment: PaymentData): Promise<void> {
    await this.waitUntilOpen();

    switch (payment.method) {
      case 'WALLET':
        await this.click(this.walletOption, 'Wallet payment');
        if (payment.walletName) {
          const walletByName = this.modal.getByText(new RegExp(payment.walletName, 'i'));
          if (await this.isVisible(walletByName)) {
            await this.click(walletByName, `Wallet: ${payment.walletName}`);
          }
        }
        break;
      case 'CARD':
        await this.click(this.cardOption, 'Card payment');
        break;
      case 'COD':
        await this.click(this.codOption, 'Cash on delivery');
        break;
      case 'UPI':
        await this.click(this.upiOption, 'UPI payment');
        break;
      default:
        throw new Error(`Unsupported payment method: ${String(payment.method)}`);
    }

    this.logger.info('Payment method selected', { method: payment.method });
  }

  async confirmPayment(): Promise<void> {
    await this.click(this.confirmPaymentButton, 'Confirm payment');
  }

  async selectWalletAndConfirm(payment: PaymentData): Promise<void> {
    await this.selectPaymentMethod(payment);
    await this.confirmPayment();
  }

  async isPaymentSuccessful(): Promise<boolean> {
    return this.isVisible(this.paymentSuccessIndicator);
  }

  async getWalletBalanceText(): Promise<string> {
    if (!(await this.isVisible(this.walletBalance))) {
      return '';
    }
    return this.getText(this.walletBalance);
  }

  async close(): Promise<void> {
    if (await this.isVisible(this.closeButton)) {
      await this.click(this.closeButton, 'Close payment modal');
    }
  }
}
