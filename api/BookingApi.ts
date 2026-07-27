import type { APIRequestContext } from '@playwright/test';
import { envConfig } from '../config/env.config';
import type { BookingResponse } from '../data/models/BookingData';
import { Logger } from '../utils/Logger';

export interface BookingApiResult {
  readonly status: number;
  readonly body: BookingResponse;
  readonly responseTimeMs: number;
  readonly headers: Record<string, string>;
}

/**
 * API client for backend booking verification.
 */
export class BookingApi {
  private readonly request: APIRequestContext;
  private readonly logger: Logger;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext, logger?: Logger, baseUrl = envConfig.apiBaseUrl) {
    this.request = request;
    this.logger = logger?.child('BookingApi') ?? new Logger('BookingApi');
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getBooking(bookingId: string): Promise<BookingApiResult> {
    const url = `${this.baseUrl}/bookings/${encodeURIComponent(bookingId)}`;
    const startedAt = Date.now();

    const response = await this.request.get(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const responseTimeMs = Date.now() - startedAt;
    const status = response.status();
    const headers = response.headers();
    let body: BookingResponse;

    try {
      body = (await response.json()) as BookingResponse;
    } catch {
      throw new Error(`Booking API returned non-JSON response for ${bookingId}`);
    }

    this.logger.api(`GET booking ${bookingId}`, {
      url,
      method: 'GET',
      headers,
      responseBody: body,
      status,
      responseTimeMs,
    });

    return { status, body, responseTimeMs, headers };
  }
}
