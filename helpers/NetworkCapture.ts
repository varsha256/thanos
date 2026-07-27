import type { Page, Request, Response } from '@playwright/test';
import { Logger } from '../utils/Logger';
import type { ReportingManager } from '../reporting/ReportingManager';

export interface CapturedExchange {
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  responseTimeMs?: number;
  startedAt: number;
}

/**
 * Captures selected network request/response pairs for reporting and API assertions.
 */
export class NetworkCapture {
  private readonly page: Page;
  private readonly reporting: ReportingManager;
  private readonly logger: Logger;
  private readonly urlPattern: RegExp;
  private readonly exchanges = new Map<string, CapturedExchange>();
  private readonly completed: CapturedExchange[] = [];

  constructor(
    page: Page,
    reporting: ReportingManager,
    urlPattern = /\/(api|bookings|orders|payments)\b/i,
    logger?: Logger,
  ) {
    this.page = page;
    this.reporting = reporting;
    this.urlPattern = urlPattern;
    this.logger = logger?.child('NetworkCapture') ?? new Logger('NetworkCapture');
    this.register();
  }

  private register(): void {
    this.page.on('request', (request: Request) => {
      if (!this.urlPattern.test(request.url())) {
        return;
      }

      const startedAt = Date.now();
      const key = this.keyFor(request);
      let requestBody: unknown;
      try {
        requestBody = request.postDataJSON();
      } catch {
        requestBody = request.postData() ?? undefined;
      }

      this.exchanges.set(key, {
        url: request.url(),
        method: request.method(),
        requestHeaders: request.headers(),
        requestBody,
        startedAt,
      });
    });

    this.page.on('response', async (response: Response) => {
      if (!this.urlPattern.test(response.url())) {
        return;
      }

      const request = response.request();
      const key = this.keyFor(request);
      const pending = this.exchanges.get(key);
      const responseTimeMs = pending ? Date.now() - pending.startedAt : undefined;

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        try {
          responseBody = await response.text();
        } catch {
          responseBody = undefined;
        }
      }

      const exchange: CapturedExchange = {
        url: response.url(),
        method: request.method(),
        requestHeaders: request.headers(),
        requestBody: pending?.requestBody,
        responseStatus: response.status(),
        responseHeaders: response.headers(),
        responseBody,
        responseTimeMs,
        startedAt: pending?.startedAt ?? Date.now(),
      };

      this.completed.push(exchange);
      this.reporting.recordNetworkEvent(exchange as unknown as Record<string, unknown>);

      this.logger.api(`${request.method()} ${response.url()}`, {
        url: response.url(),
        method: request.method(),
        headers: request.headers(),
        requestBody: pending?.requestBody,
        responseBody,
        status: response.status(),
        responseTimeMs,
      });
    });
  }

  findBookingResponse(): CapturedExchange | undefined {
    return [...this.completed]
      .reverse()
      .find(
        (exchange) =>
          /booking|order/i.test(exchange.url) &&
          exchange.method.toUpperCase() === 'POST' &&
          exchange.responseStatus !== undefined &&
          exchange.responseStatus < 400,
      );
  }

  getAll(): readonly CapturedExchange[] {
    return this.completed;
  }

  private keyFor(request: Request): string {
    return `${request.method()}:${request.url()}:${request.postData() ?? ''}`;
  }
}
