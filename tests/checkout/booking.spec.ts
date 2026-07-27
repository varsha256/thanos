import { test, expect } from '../../fixtures';
import { CheckoutAssertions } from '../../helpers/CheckoutAssertions';
import { PriceCalculator } from '../../utils/PriceCalculator';

/**
 * Checkout booking — business scenario only.
 * All interactions and orchestration live in CheckoutWorkflow / Page Objects.
 */
test.describe('Checkout Booking @smoke @checkout', () => {
  test.describe.configure({ mode: 'serial' });

  test('Customer completes food checkout with wallet payment and verified booking', async ({
    checkoutWorkflow,
    bookingData,
    reporting,
    logger,
    executionContext,
  }) => {
    logger.info('Starting checkout booking scenario', {
      browser: executionContext.browserName,
      environment: executionContext.environment,
      workerId: executionContext.workerId,
      timestamp: executionContext.executionTimestamp,
    });

    await reporting.attachJson('scenario-context', executionContext);

    const expectedTotal = PriceCalculator.calculateExpectedTotal(
      bookingData.itemUnitPrice,
      bookingData.quantity,
      bookingData.deliveryFee,
      bookingData.couponDiscountAmount,
    );

    expect(
      bookingData.expectedPrice,
      'Test data expectedPrice should match calculated total',
    ).toBeCloseTo(expectedTotal, 2);

    const result = await checkoutWorkflow.completeCheckout(bookingData);

    const assertions = new CheckoutAssertions(logger);
    assertions.assertBookingIdGenerated(result.bookingId);
    assertions.assertBookingStatusConfirmed(
      result.confirmation.status,
      bookingData.expectedStatus,
    );
    assertions.assertTotalPrice(result.confirmation.totalPrice, bookingData.expectedPrice);
    assertions.assertRestaurantName(
      result.confirmation.restaurantName,
      bookingData.restaurant,
    );
    assertions.assertFoodItem(result.confirmation.foodItem, bookingData.foodItem);
    assertions.assertCouponDiscount(
      result.confirmation.couponDiscount,
      bookingData.couponDiscountAmount,
    );
    assertions.assertWalletPaymentSuccessful(result.confirmation.paymentMethod);
    assertions.assertConfirmationDisplayed(result.confirmation.isConfirmationVisible);

    if (result.apiStatusCode !== undefined) {
      assertions.assertApiStatusCode(result.apiStatusCode, 200);
    }

    if (result.bookingResponse) {
      assertions.assertBackendBookingStatus(
        result.bookingResponse.status,
        bookingData.expectedStatus,
      );
    }

    logger.info('Checkout booking scenario completed', {
      bookingId: result.bookingId,
      status: result.confirmation.status,
    });
  });
});
