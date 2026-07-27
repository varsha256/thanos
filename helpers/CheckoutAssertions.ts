import { expect } from '@playwright/test';
import type {
  BookingResponse,
  BookingTestData,
  ConfirmationDetails,
} from '../data/models/BookingData';
import { Logger } from '../utils/Logger';

/**
 * Assertion helpers separated from UI actions.
 * Keeps Page Objects free of business verification logic.
 */
export class CheckoutAssertions {
  private readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger?.child('CheckoutAssertions') ?? new Logger('CheckoutAssertions');
  }

  assertBookingIdGenerated(bookingId: string): void {
    expect(bookingId, 'Booking ID should be generated').toBeTruthy();
    expect(bookingId, 'Booking ID should not be null').not.toBeNull();
    expect(bookingId.trim().length, 'Booking ID should not be empty').toBeGreaterThan(0);
    this.logger.info('Booking ID verified', { bookingId });
  }

  assertBookingStatusConfirmed(status: string, expected = 'CONFIRMED'): void {
    expect(status.toUpperCase(), 'Booking status should be CONFIRMED').toBe(expected);
    this.logger.info('Booking status verified', { status });
  }

  assertTotalPrice(actual: number, expected: number): void {
    expect(actual, 'Displayed total price should equal expected price').toBeCloseTo(expected, 2);
    this.logger.info('Total price verified', { actual, expected });
  }

  assertRestaurantName(actual: string, expected: string): void {
    expect(actual.toLowerCase(), 'Restaurant name should match test data').toContain(
      expected.toLowerCase(),
    );
    this.logger.info('Restaurant name verified', { actual, expected });
  }

  assertFoodItem(actual: string, expected: string): void {
    expect(actual.toLowerCase(), 'Food item should match selected item').toContain(
      expected.toLowerCase(),
    );
    this.logger.info('Food item verified', { actual, expected });
  }

  assertCouponDiscount(actual: number, expected: number): void {
    expect(actual, 'Coupon discount should be applied correctly').toBeCloseTo(expected, 2);
    this.logger.info('Coupon discount verified', { actual, expected });
  }

  assertWalletPaymentSuccessful(paymentMethod: string, paymentStatus?: string): void {
    expect(paymentMethod.toUpperCase(), 'Payment method should be WALLET').toMatch(/WALLET/);
    if (paymentStatus) {
      expect(paymentStatus.toUpperCase(), 'Wallet payment should be successful').toMatch(
        /SUCCESS|PAID|COMPLETED|CONFIRMED/,
      );
    }
    this.logger.info('Wallet payment verified', { paymentMethod, paymentStatus });
  }

  assertConfirmationDisplayed(isVisible: boolean): void {
    expect(isVisible, 'Confirmation page should be displayed').toBe(true);
    this.logger.info('Confirmation page visibility verified');
  }

  assertOrderInHistory(isPresent: boolean, bookingId: string): void {
    expect(isPresent, `Order ${bookingId} should appear in Order History`).toBe(true);
    this.logger.info('Order history presence verified', { bookingId });
  }

  assertApiStatusCode(statusCode: number, expected = 200): void {
    expect(statusCode, 'API response status code should be 200').toBe(expected);
    this.logger.info('API status code verified', { statusCode });
  }

  assertBackendBookingStatus(status: string, expected = 'CONFIRMED'): void {
    expect(status.toUpperCase(), 'Backend booking status should be CONFIRMED').toBe(expected);
    this.logger.info('Backend booking status verified', { status });
  }

  assertConfirmationMatchesTestData(
    details: ConfirmationDetails,
    data: BookingTestData,
  ): void {
    this.assertBookingIdGenerated(details.bookingId);
    this.assertBookingStatusConfirmed(details.status, data.expectedStatus);
    this.assertTotalPrice(details.totalPrice, data.expectedPrice);
    this.assertRestaurantName(details.restaurantName, data.restaurant);
    this.assertFoodItem(details.foodItem, data.foodItem);
    this.assertCouponDiscount(details.couponDiscount, data.couponDiscountAmount);
    this.assertWalletPaymentSuccessful(details.paymentMethod);
    this.assertConfirmationDisplayed(details.isConfirmationVisible);
  }

  assertBookingResponse(
    response: BookingResponse,
    data: BookingTestData,
    httpStatus: number,
  ): void {
    this.assertApiStatusCode(httpStatus, 200);
    this.assertBookingIdGenerated(response.bookingId);
    this.assertBackendBookingStatus(response.status, data.expectedStatus);
    this.assertTotalPrice(response.totalPrice, data.expectedPrice);
    this.assertRestaurantName(response.restaurantName, data.restaurant);
    this.assertFoodItem(response.foodItem, data.foodItem);
    this.assertWalletPaymentSuccessful(response.paymentMethod, response.paymentStatus);

    if (response.discountAmount !== undefined) {
      this.assertCouponDiscount(response.discountAmount, data.couponDiscountAmount);
    }
  }

  /**
   * Placeholder for database-level booking validation.
   * Wire this to your DB client (Postgres/MySQL/Dynamo) in CI environments.
   */
  async assertBookingInDatabase(
    bookingId: string,
    expectedStatus = 'CONFIRMED',
  ): Promise<void> {
    this.logger.info('Database validation placeholder invoked', {
      bookingId,
      expectedStatus,
    });

    // TODO: Replace with real DB query, e.g.:
    // const row = await db.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
    // expect(row.status).toBe(expectedStatus);

    expect(bookingId, 'Database validation requires a booking ID').toBeTruthy();
  }
}
