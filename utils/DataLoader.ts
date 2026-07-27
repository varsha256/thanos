import * as fs from 'node:fs';
import * as path from 'node:path';
import type { BookingTestData } from '../data/models/BookingData';
import { Logger } from './Logger';

const logger = new Logger('DataLoader');

/**
 * Loads and validates external JSON test data.
 * Keeps hardcoded domain values out of specs and workflows.
 */
export class DataLoader {
  static loadBookingData(relativePath = 'data/bookingData.json'): BookingTestData {
    const absolutePath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Booking test data not found at: ${absolutePath}`);
    }

    const raw = fs.readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(raw) as BookingTestData;
    this.validateBookingData(data);

    logger.info('Booking test data loaded', {
      path: relativePath,
      restaurant: data.restaurant,
      foodItem: data.foodItem,
      payment: data.payment.method,
    });

    return Object.freeze(data);
  }

  private static validateBookingData(data: BookingTestData): void {
    const required: Array<keyof BookingTestData> = [
      'restaurant',
      'foodItem',
      'quantity',
      'coupon',
      'address',
      'payment',
      'expectedPrice',
      'expectedStatus',
    ];

    for (const key of required) {
      if (data[key] === undefined || data[key] === null || data[key] === '') {
        throw new Error(`Invalid booking data: missing required field "${key}"`);
      }
    }

    if (data.quantity < 1) {
      throw new Error('Invalid booking data: quantity must be >= 1');
    }

    if (data.payment.method !== 'WALLET') {
      logger.warn('Payment method is not WALLET; checkout flow expects wallet selection', {
        method: data.payment.method,
      });
    }
  }
}
