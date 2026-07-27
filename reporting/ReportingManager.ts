import { test, type TestInfo } from '@playwright/test';
import type {
  BookingResponse,
  BookingTestData,
  ExecutionContext,
  StepMetric,
} from '../data/models/BookingData';
import { Logger } from '../utils/Logger';

export interface ReportAttachment {
  name: string;
  body: string | Buffer;
  contentType: string;
}

/**
 * Reusable reporting facade.
 * Wraps Playwright test.step, attaches JSON/screenshots, and tracks step timing.
 */
export class ReportingManager {
  private readonly logger: Logger;
  private readonly testInfo: TestInfo;
  private readonly executionContext: ExecutionContext;
  private readonly stepMetrics: StepMetric[] = [];
  private readonly networkEvents: Array<Record<string, unknown>> = [];

  constructor(testInfo: TestInfo, executionContext: ExecutionContext, logger?: Logger) {
    this.testInfo = testInfo;
    this.executionContext = executionContext;
    this.logger = logger ?? new Logger('ReportingManager');
  }

  get context(): ExecutionContext {
    return this.executionContext;
  }

  get metrics(): readonly StepMetric[] {
    return this.stepMetrics;
  }

  async runStep<T>(
    stepName: string,
    action: () => Promise<T>,
    options?: { attachResultAs?: string },
  ): Promise<T> {
    return test.step(stepName, async () => {
      const startedAt = new Date();
      this.logger.step(`START: ${stepName}`);

      try {
        const result = await action();
        const finishedAt = new Date();
        const durationMs = finishedAt.getTime() - startedAt.getTime();

        this.stepMetrics.push({
          stepName,
          durationMs,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          status: 'passed',
        });

        this.logger.step(`PASS: ${stepName} (${durationMs}ms)`);

        if (options?.attachResultAs && result !== undefined) {
          await this.attachJson(options.attachResultAs, result);
        }

        await this.attachJson(`${stepName} - duration`, {
          stepName,
          durationMs,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
        });

        return result;
      } catch (error) {
        const finishedAt = new Date();
        const durationMs = finishedAt.getTime() - startedAt.getTime();

        this.stepMetrics.push({
          stepName,
          durationMs,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          status: 'failed',
        });

        this.logger.error(`FAIL: ${stepName} (${durationMs}ms)`, {
          error: error instanceof Error ? error.message : String(error),
        });

        throw error;
      }
    });
  }

  async attachJson(name: string, data: unknown): Promise<void> {
    const body = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
    await this.testInfo.attach(name, {
      body,
      contentType: 'application/json',
    });
    this.logger.info(`Attached JSON: ${name}`);
  }

  async attachScreenshot(name: string, screenshot: Buffer): Promise<void> {
    await this.testInfo.attach(name, {
      body: screenshot,
      contentType: 'image/png',
    });
    this.logger.info(`Attached screenshot: ${name}`);
  }

  async attachText(name: string, content: string, contentType = 'text/plain'): Promise<void> {
    await this.testInfo.attach(name, {
      body: Buffer.from(content, 'utf-8'),
      contentType,
    });
  }

  async attachBookingResponse(booking: BookingResponse): Promise<void> {
    await this.attachJson('booking-response', booking);
  }

  async attachTestData(data: BookingTestData): Promise<void> {
    await this.attachJson('test-data', data);
  }

  async attachExecutionMetadata(): Promise<void> {
    await this.attachJson('execution-metadata', {
      ...this.executionContext,
      stepMetrics: this.stepMetrics,
      networkEventCount: this.networkEvents.length,
    });
  }

  recordNetworkEvent(event: Record<string, unknown>): void {
    this.networkEvents.push(event);
  }

  async attachNetworkCapture(label = 'network-capture'): Promise<void> {
    if (this.networkEvents.length === 0) {
      this.logger.warn('No network events captured to attach');
      return;
    }
    await this.attachJson(label, this.networkEvents);
  }

  async finalize(): Promise<void> {
    await this.attachExecutionMetadata();
    await this.attachNetworkCapture();
    this.logger.info('Reporting finalized', {
      steps: this.stepMetrics.length,
      browser: this.executionContext.browserName,
      environment: this.executionContext.environment,
      workerId: this.executionContext.workerId,
    });
  }
}
