import type { Locator, Page } from '@playwright/test';
import { AddressModalComponent } from '../components/AddressModal';
import { PaymentModalComponent } from '../components/PaymentModal';
import { ToastComponent } from '../components/Toast';
import type { AddressData, PaymentData } from '../data/models/BookingData';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

/**
 * Checkout page — address, payment, and order placement.
 */
export class CheckoutPage extends BasePage {
  readonly addressModal: AddressModalComponent;
  readonly paymentModal: PaymentModalComponent;
  readonly toast: ToastComponent;

  private readonly checkoutContainer: Locator;
  private readonly changeAddressButton: Locator;
  private readonly selectedAddress: Locator;
  private readonly changePaymentButton: Locator;
  private readonly selectedPayment: Locator;
  private readonly orderTotal: Locator;
  private readonly restaurantName: Locator;
  private readonly foodItemName: Locator;
  private readonly couponDiscount: Locator;
  private readonly placeOrderButton: Locator;

  constructor(page: Page, logger?: Logger) {
    const pageLogger = logger?.child('CheckoutPage') ?? new Logger('CheckoutPage');
    super(page, pageLogger);
    this.addressModal = new AddressModalComponent(page, pageLogger);
    this.paymentModal = new PaymentModalComponent(page, pageLogger);
    this.toast = new ToastComponent(page, pageLogger);

    this.checkoutContainer = page.getByTestId('checkout-container');
    this.changeAddressButton = page.getByTestId('change-address').or(
      page.getByRole('button', { name: /change address|select address|add address/i }),
    );
    this.selectedAddress = page.getByTestId('selected-address');
    this.changePaymentButton = page.getByTestId('change-payment').or(
      page.getByRole('button', { name: /change payment|select payment|payment method/i }),
    );
    this.selectedPayment = page.getByTestId('selected-payment');
    this.orderTotal = page.getByTestId('checkout-total');
    this.restaurantName = page.getByTestId('checkout-restaurant-name');
    this.foodItemName = page.getByTestId('checkout-food-item');
    this.couponDiscount = page.getByTestId('checkout-coupon-discount');
    this.placeOrderButton = page.getByTestId('place-order').or(
      page.getByRole('button', { name: /place order|confirm order/i }),
    );
  }

  async waitForCheckout(): Promise<void> {
    await this.waitForVisible(this.checkoutContainer);
  }

  async chooseDeliveryAddress(address: AddressData, preferSaved = true): Promise<void> {
    await this.click(this.changeAddressButton, 'Open address modal');
    if (preferSaved) {
      try {
        await this.addressModal.selectSavedAddress(address.label);
        return;
      } catch {
        this.logger.warn('Saved address not found; adding new address', {
          label: address.label,
        });
      }
    }
    await this.addressModal.addAndSelectAddress(address);
  }

  async selectWalletPayment(payment: PaymentData): Promise<void> {
    await this.click(this.changePaymentButton, 'Open payment modal');
    await this.paymentModal.selectWalletAndConfirm(payment);
    this.logger.info('Payment completed', { method: payment.method });
  }

  async placeOrder(): Promise<void> {
    await this.click(this.placeOrderButton, 'Place order');
  }

  async getOrderTotal(): Promise<number> {
    const text = await this.getText(this.orderTotal);
    return this.parseCurrency(text);
  }

  async getRestaurantName(): Promise<string> {
    return this.getText(this.restaurantName);
  }

  async getFoodItemName(): Promise<string> {
    return this.getText(this.foodItemName);
  }

  async getCouponDiscount(): Promise<number> {
    const text = await this.getText(this.couponDiscount);
    return this.parseCurrency(text);
  }

  async getSelectedPaymentMethod(): Promise<string> {
    return this.getText(this.selectedPayment);
  }

  async getSelectedAddressText(): Promise<string> {
    return this.getText(this.selectedAddress);
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
