import type { Page, Request, Response, TestInfo } from '@playwright/test';
import { Logger } from '../utils/Logger';
import type { ReportingManager } from '../reporting/ReportingManager';

interface FailedNetworkRequest {
  url: string;
  method: string;
  failure?: string;
  status?: number;
  resourceType: string;
}

interface ConsoleEntry {
  type: string;
  text: string;
  location?: string;
}

/**
 * Captures diagnostic artifacts on assertion / step failures.
 */
export class FailureHandler {
  private readonly page: Page;
  private readonly testInfo: TestInfo;
  private readonly reporting: ReportingManager;
  private readonly logger: Logger;
  private readonly failedRequests: FailedNetworkRequest[] = [];
  private readonly consoleLogs: ConsoleEntry[] = [];
  private attached = false;

  constructor(
    page: Page,
    testInfo: TestInfo,
    reporting: ReportingManager,
    logger?: Logger,
  ) {
    this.page = page;
    this.testInfo = testInfo;
    this.reporting = reporting;
    this.logger = logger?.child('FailureHandler') ?? new Logger('FailureHandler');
    this.registerListeners();
  }

  private registerListeners(): void {
    this.page.on('requestfailed', (request: Request) => {
      this.failedRequests.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        resourceType: request.resourceType(),
      });
    });

    this.page.on('response', (response: Response) => {
      if (response.status() >= 400) {
        this.failedRequests.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          resourceType: response.request().resourceType(),
        });
      }
    });

    this.page.on('console', (msg) => {
      this.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location().url,
      });
    });
  }

  async captureAll(reason: string): Promise<void> {
    if (this.attached) {
      return;
    }
    this.attached = true;
    this.logger.error('Capturing failure artifacts', { reason });

    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.reporting.attachScreenshot('failure-screenshot', screenshot);
    } catch (error) {
      this.logger.warn('Failed to capture screenshot', { error: String(error) });
    }

    try {
      const html = await this.page.content();
      await this.reporting.attachText('failure-page.html', html, 'text/html');
    } catch (error) {
      this.logger.warn('Failed to capture page HTML', { error: String(error) });
    }

    try {
      await this.reporting.attachJson('failure-console-logs', this.consoleLogs);
    } catch (error) {
      this.logger.warn('Failed to attach console logs', { error: String(error) });
    }

    try {
      await this.reporting.attachJson('failed-network-requests', this.failedRequests);
    } catch (error) {
      this.logger.warn('Failed to attach failed network requests', { error: String(error) });
    }

    try {
      // Ensure Playwright trace is retained for this failure.
      await this.testInfo.attach('failure-trace-hint', {
        body: Buffer.from(
          'Trace collection is enabled via playwright.config (trace: on-first-retry / retain-on-failure).',
          'utf-8',
        ),
        contentType: 'text/plain',
      });
    } catch {
      // no-op
    }
  }

  getFailedRequests(): readonly FailedNetworkRequest[] {
    return this.failedRequests;
  }

  getConsoleLogs(): readonly ConsoleEntry[] {
    return this.consoleLogs;
  }
}
