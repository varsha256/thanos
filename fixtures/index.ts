import {
  test as base,
  type APIRequestContext,
  type Browser,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { envConfig } from '../config/env.config';
import type { BookingTestData, ExecutionContext } from '../data/models/BookingData';
import { FailureHandler } from '../helpers/FailureHandler';
import { ReportingManager } from '../reporting/ReportingManager';
import { DataLoader } from '../utils/DataLoader';
import { Logger } from '../utils/Logger';
import { CheckoutWorkflow } from '../workflows/CheckoutWorkflow';

export interface CheckoutFixtures {
  logger: Logger;
  bookingData: BookingTestData;
  executionContext: ExecutionContext;
  reporting: ReportingManager;
  failureHandler: FailureHandler;
  checkoutWorkflow: CheckoutWorkflow;
}

function buildExecutionContext(
  testInfo: TestInfo,
  browser: Browser,
): ExecutionContext {
  return {
    browserName: browser.browserType().name(),
    environment: envConfig.name,
    workerId: String(testInfo.workerIndex),
    executionTimestamp: new Date().toISOString(),
    testTitle: testInfo.title,
  };
}

/**
 * Playwright fixtures with constructor-based dependency injection.
 */
export const test = base.extend<CheckoutFixtures>({
  logger: async ({}, use, testInfo) => {
    const logger = new Logger(`Test:${testInfo.title}`);
    await use(logger);
  },

  bookingData: async ({ logger }, use) => {
    const data = DataLoader.loadBookingData();
    logger.info('Fixture bookingData ready', {
      restaurant: data.restaurant,
      foodItem: data.foodItem,
    });
    await use(data);
  },

  executionContext: async ({ browser }, use, testInfo) => {
    await use(buildExecutionContext(testInfo, browser));
  },

  reporting: async ({ executionContext, logger }, use, testInfo) => {
    const reporting = new ReportingManager(testInfo, executionContext, logger);
    await use(reporting);
  },

  failureHandler: async ({ page, reporting, logger }, use, testInfo) => {
    const handler = new FailureHandler(page, testInfo, reporting, logger);
    await use(handler);
  },

  checkoutWorkflow: async (
    {
      page,
      reporting,
      request,
      failureHandler,
      logger,
    }: {
      page: Page;
      reporting: ReportingManager;
      request: APIRequestContext;
      failureHandler: FailureHandler;
      logger: Logger;
    },
    use,
  ) => {
    const workflow = new CheckoutWorkflow(
      page,
      reporting,
      request,
      failureHandler,
      logger,
    );
    await use(workflow);
  },
});

export { expect } from '@playwright/test';
