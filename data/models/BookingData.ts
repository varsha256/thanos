/**
 * Strongly-typed test data contracts for checkout booking flows.
 */

export interface AddressData {
  readonly label: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly landmark?: string;
}

export interface PaymentData {
  readonly method: 'WALLET' | 'CARD' | 'COD' | 'UPI';
  readonly walletName?: string;
}

export interface BookingTestData {
  readonly restaurant: string;
  readonly foodItem: string;
  readonly quantity: number;
  readonly coupon: string;
  readonly couponDiscountAmount: number;
  readonly address: AddressData;
  readonly payment: PaymentData;
  readonly itemUnitPrice: number;
  readonly deliveryFee: number;
  readonly expectedPrice: number;
  readonly expectedStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  readonly credentials?: {
    readonly email: string;
    readonly password: string;
  };
}

export interface BookingResponse {
  readonly bookingId: string;
  readonly status: string;
  readonly restaurantName: string;
  readonly foodItem: string;
  readonly quantity: number;
  readonly couponCode?: string;
  readonly discountAmount?: number;
  readonly totalPrice: number;
  readonly paymentMethod: string;
  readonly paymentStatus: string;
  readonly createdAt?: string;
}

export interface ConfirmationDetails {
  readonly bookingId: string;
  readonly status: string;
  readonly restaurantName: string;
  readonly foodItem: string;
  readonly totalPrice: number;
  readonly couponDiscount: number;
  readonly paymentMethod: string;
  readonly isConfirmationVisible: boolean;
}

export interface StepMetric {
  readonly stepName: string;
  readonly durationMs: number;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly status: 'passed' | 'failed';
}

export interface ExecutionContext {
  readonly browserName: string;
  readonly environment: string;
  readonly workerId: string;
  readonly executionTimestamp: string;
  readonly testTitle: string;
}
