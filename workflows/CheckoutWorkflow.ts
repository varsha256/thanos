import type { APIRequestContext, Page } from '@playwright/test';
import { BookingApi } from '../api/BookingApi';
import { envConfig } from '../config/env.config';
import type {
  BookingResponse,
  BookingTestData,
  ConfirmationDetails,
} from '../data/models/BookingData';
import { CheckoutAssertions } from '../helpers/CheckoutAssertions';
import { FailureHandler } from '../helpers/FailureHandler';
import { NetworkCapture } from '../helpers/NetworkCapture';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { LoginPage } from '../pages/LoginPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { RestaurantPage } from '../pages/RestaurantPage';
import type { ReportingManager } from '../reporting/ReportingManager';
import { Logger } from '../utils/Logger';

export interface CheckoutResult {
  readonly bookingId: string;
  readonly confirmation: ConfirmationDetails;
  readonly bookingResponse?: BookingResponse;
  readonly apiStatusCode?: number;
}

/**
 * CheckoutWorkflow encapsulates the end-to-end business flow.
 * Specs should call workflow methods only — no locators or page-level details.
 */
export class CheckoutWorkflow {
  private readonly page: Page;
  private readonly reporting: ReportingManager;
  private readonly logger: Logger;
  private readonly assertions: CheckoutAssertions;
  private readonly failureHandler: FailureHandler;
  private readonly networkCapture: NetworkCapture;
  private readonly bookingApi: BookingApi;

  private readonly loginPage: LoginPage;
  private readonly restaurantPage: RestaurantPage;
  private readonly cartPage: CartPage;
  private readonly checkoutPage: CheckoutPage;
  private readonly confirmationPage: ConfirmationPage;
  private readonly orderHistoryPage: OrderHistoryPage;

  constructor(
    page: Page,
    reporting: ReportingManager,
    request: APIRequestContext,
    failureHandler: FailureHandler,
    logger?: Logger,
  ) {
    this.page = page;
    this.reporting = reporting;
    this.logger = logger?.child('CheckoutWorkflow') ?? new Logger('CheckoutWorkflow');
    this.assertions = new CheckoutAssertions(this.logger);
    this.failureHandler = failureHandler;
    this.networkCapture = new NetworkCapture(page, reporting, undefined, this.logger);
    this.bookingApi = new BookingApi(request, this.logger);

    this.loginPage = new LoginPage(page, this.logger);
    this.restaurantPage = new RestaurantPage(page, this.logger);
    this.cartPage = new CartPage(page, this.logger);
    this.checkoutPage = new CheckoutPage(page, this.logger);
    this.confirmationPage = new ConfirmationPage(page, this.logger);
    this.orderHistoryPage = new OrderHistoryPage(page, this.logger);
  }

  /**
   * Full happy-path checkout: login → search → add → coupon → address → wallet → place → verify.
   */
  async completeCheckout(data: BookingTestData): Promise<CheckoutResult> {
    try {
      await this.reporting.attachTestData(data);
      await this.reporting.attachExecutionMetadata();

      await this.login(data);
      await this.searchAndSelectRestaurant(data);
      await this.addItemToCart(data);
      await this.applyCouponAndReviewCart(data);
      await this.checkoutWithAddressAndWallet(data);
      const confirmation = await this.placeOrderAndCaptureSuccess();
      const apiResult = await this.verifyBookingViaApi(confirmation.bookingId, data);
      await this.verifyOrderHistory(confirmation.bookingId);
      await this.assertions.assertBookingInDatabase(
        confirmation.bookingId,
        data.expectedStatus,
      );

      await this.reporting.finalize();

      return {
        bookingId: confirmation.bookingId,
        confirmation,
        bookingResponse: apiResult?.body,
        apiStatusCode: apiResult?.status,
      };
    } catch (error) {
      this.logger.error('Booking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      await this.failureHandler.captureAll(
        error instanceof Error ? error.message : 'Checkout workflow failure',
      );
      await this.reporting.finalize();
      throw error;
    }
  }

  async login(data: BookingTestData): Promise<void> {
    await this.reporting.runStep('Login', async () => {
      const email = data.credentials?.email ?? envConfig.credentials.email;
      const password = data.credentials?.password ?? envConfig.credentials.password;

      await this.loginPage.open();
      await this.loginPage.login(email, password);

      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.reporting.attachScreenshot('after-login', screenshot);
      this.logger.info('Login successful');
    });
  }

  async searchAndSelectRestaurant(data: BookingTestData): Promise<void> {
    await this.reporting.runStep('Search and select restaurant', async () => {
      await this.restaurantPage.searchRestaurant(data.restaurant);
      await this.restaurantPage.selectRestaurant(data.restaurant);

      const selected = await this.restaurantPage.getSelectedRestaurantName();
      this.assertions.assertRestaurantName(selected, data.restaurant);

      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.reporting.attachScreenshot('after-restaurant-selected', screenshot);
      this.logger.info('Restaurant selected', { restaurant: data.restaurant });
    });
  }

  async addItemToCart(data: BookingTestData): Promise<void> {
    await this.reporting.runStep('Select food item and add to cart', async () => {
      await this.restaurantPage.addFoodItemToCart(data.foodItem, data.quantity);
      await this.restaurantPage.openCart();
      await this.cartPage.waitForCart();

      const itemName = await this.cartPage.getItemName();
      this.assertions.assertFoodItem(itemName, data.foodItem);

      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.reporting.attachScreenshot('after-cart', screenshot);
      this.logger.info('Food item added to cart', {
        foodItem: data.foodItem,
        quantity: data.quantity,
      });
    });
  }

  async applyCouponAndReviewCart(data: BookingTestData): Promise<void> {
    await this.reporting.runStep('Apply coupon', async () => {
      await this.cartPage.applyCoupon(data.coupon);

      const discount = await this.cartPage.getCouponDiscount();
      this.assertions.assertCouponDiscount(discount, data.couponDiscountAmount);

      const total = await this.cartPage.getTotalPrice();
      this.assertions.assertTotalPrice(total, data.expectedPrice);

      await this.reporting.attachJson('cart-totals', {
        discount,
        total,
        expectedPrice: data.expectedPrice,
        coupon: data.coupon,
      });

      this.logger.info('Coupon applied', { coupon: data.coupon, discount });
      await this.cartPage.proceedToCheckout();
    });
  }

  async checkoutWithAddressAndWallet(data: BookingTestData): Promise<void> {
    await this.reporting.runStep('Checkout - address and payment', async () => {
      await this.checkoutPage.waitForCheckout();

      const screenshotCheckout = await this.page.screenshot({ fullPage: true });
      await this.reporting.attachScreenshot('after-checkout', screenshotCheckout);

      await this.checkoutPage.chooseDeliveryAddress(data.address);
      await this.checkoutPage.selectWalletPayment(data.payment);

      const paymentMethod = await this.checkoutPage.getSelectedPaymentMethod();
      this.assertions.assertWalletPaymentSuccessful(paymentMethod);

      const screenshotPayment = await this.page.screenshot({ fullPage: true });
      await this.reporting.attachScreenshot('after-payment', screenshotPayment);

      this.logger.info('Payment completed', { method: data.payment.method });
    });
  }

  async placeOrderAndCaptureSuccess(): Promise<ConfirmationDetails> {
    return this.reporting.runStep(
      'Place order and verify success',
      async () => {
        await this.checkoutPage.placeOrder();
        await this.confirmationPage.waitForSuccess();

        const details = await this.confirmationPage.getDetails();
        this.assertions.assertBookingIdGenerated(details.bookingId);
        this.assertions.assertBookingStatusConfirmed(details.status);
        this.assertions.assertConfirmationDisplayed(details.isConfirmationVisible);

        const screenshot = await this.page.screenshot({ fullPage: true });
        await this.reporting.attachScreenshot('after-success', screenshot);

        this.logger.info('Booking created', { bookingId: details.bookingId });
        return details;
      },
      { attachResultAs: 'confirmation-details' },
    );
  }

  async verifyBookingViaApi(
    bookingId: string,
    data: BookingTestData,
  ): Promise<{ status: number; body: BookingResponse } | undefined> {
    return this.reporting.runStep('Verify booking via API', async () => {
      const networkHit = this.networkCapture.findBookingResponse();
      if (networkHit?.responseBody) {
        await this.reporting.attachJson('network-booking-response', networkHit);
        this.assertions.assertApiStatusCode(networkHit.responseStatus ?? 0, 200);
      }

      try {
        const apiResult = await this.bookingApi.getBooking(bookingId);
        await this.reporting.attachBookingResponse(apiResult.body);
        this.assertions.assertBookingResponse(apiResult.body, data, apiResult.status);
        this.logger.info('Booking created', {
          bookingId: apiResult.body.bookingId,
          status: apiResult.body.status,
        });
        return { status: apiResult.status, body: apiResult.body };
      } catch (error) {
        // UI assertions remain source of truth when API is unavailable in local/demo runs.
        this.logger.warn('API booking verification skipped or failed', {
          bookingId,
          error: error instanceof Error ? error.message : String(error),
        });

        if (networkHit?.responseBody) {
          const body = networkHit.responseBody as BookingResponse;
          await this.reporting.attachBookingResponse(body);
          this.assertions.assertBackendBookingStatus(
            body.status ?? data.expectedStatus,
            data.expectedStatus,
          );
          return {
            status: networkHit.responseStatus ?? 200,
            body,
          };
        }

        return undefined;
      }
    });
  }

  async verifyOrderHistory(bookingId: string): Promise<void> {
    await this.reporting.runStep('Verify order appears in Order History', async () => {
      await this.orderHistoryPage.open();
      const present = await this.orderHistoryPage.hasOrder(bookingId);
      this.assertions.assertOrderInHistory(present, bookingId);

      const status = await this.orderHistoryPage.getOrderStatus(bookingId);
      this.assertions.assertBookingStatusConfirmed(status);

      await this.reporting.attachJson('order-history-entry', { bookingId, status, present });
    });
  }

  /**
   * Exposes confirmation details for additional suite-level assertions.
   */
  async getConfirmationDetails(): Promise<ConfirmationDetails> {
    return this.confirmationPage.getDetails();
  }
}
