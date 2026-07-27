import type { Locator, Page } from '@playwright/test';
import { ToastComponent } from '../components/Toast';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

/**
 * Cart review page — coupon application and proceed to checkout.
 */
export class CartPage extends BasePage {
  readonly toast: ToastComponent;

  private readonly cartContainer: Locator;
  private readonly itemName: Locator;
  private readonly itemQuantity: Locator;
  private readonly itemPrice: Locator;
  private readonly couponInput: Locator;
  private readonly applyCouponButton: Locator;
  private readonly couponDiscount: Locator;
  private readonly subtotal: Locator;
  private readonly deliveryFee: Locator;
  private readonly totalPrice: Locator;
  private readonly checkoutButton: Locator;
  private readonly emptyCartMessage: Locator;

  constructor(page: Page, logger?: Logger) {
    const pageLogger = logger?.child('CartPage') ?? new Logger('CartPage');
    super(page, pageLogger);
    this.toast = new ToastComponent(page, pageLogger);

    this.cartContainer = page.getByTestId('cart-container');
    this.itemName = page.getByTestId('cart-item-name');
    this.itemQuantity = page.getByTestId('cart-item-quantity');
    this.itemPrice = page.getByTestId('cart-item-price');
    this.couponInput = page.getByTestId('coupon-input');
    this.applyCouponButton = page.getByTestId('apply-coupon').or(
      page.getByRole('button', { name: /apply coupon|apply/i }),
    );
    this.couponDiscount = page.getByTestId('coupon-discount');
    this.subtotal = page.getByTestId('cart-subtotal');
    this.deliveryFee = page.getByTestId('cart-delivery-fee');
    this.totalPrice = page.getByTestId('cart-total');
    this.checkoutButton = page.getByTestId('proceed-to-checkout').or(
      page.getByRole('button', { name: /checkout|proceed/i }),
    );
    this.emptyCartMessage = page.getByTestId('empty-cart');
  }

  async waitForCart(): Promise<void> {
    await this.waitForVisible(this.cartContainer);
  }

  async getItemName(): Promise<string> {
    return this.getText(this.itemName.first());
  }

  async getItemQuantity(): Promise<number> {
    const text = await this.getText(this.itemQuantity.first());
    return Number.parseInt(text.replace(/\D/g, ''), 10);
  }

  async applyCoupon(couponCode: string): Promise<void> {
    this.logger.info(`Applying coupon: ${couponCode}`);
    await this.clearAndFill(this.couponInput, couponCode, 'Coupon code');
    await this.click(this.applyCouponButton, 'Apply coupon');
    await this.toast.expectSuccess(/coupon|applied|discount/i);
    this.logger.info('Coupon applied');
  }

  async getCouponDiscount(): Promise<number> {
    const text = await this.getText(this.couponDiscount);
    return this.parseCurrency(text);
  }

  async getTotalPrice(): Promise<number> {
    const text = await this.getText(this.totalPrice);
    return this.parseCurrency(text);
  }

  async getSubtotal(): Promise<number> {
    const text = await this.getText(this.subtotal);
    return this.parseCurrency(text);
  }

  async getDeliveryFee(): Promise<number> {
    const text = await this.getText(this.deliveryFee);
    return this.parseCurrency(text);
  }

  async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton, 'Proceed to checkout');
  }

  async isEmpty(): Promise<boolean> {
    return this.isVisible(this.emptyCartMessage);
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
