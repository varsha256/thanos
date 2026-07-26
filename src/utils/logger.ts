/* eslint-disable no-console */

/** Minimal structured logger. Prefixes messages with the parallel worker index. */
const worker = () => `[worker ${process.env.TEST_WORKER_INDEX ?? '-'}]`;

export const logger = {
  info: (msg: string): void => console.log(`${worker()} INFO  ${msg}`),
  warn: (msg: string): void => console.warn(`${worker()} WARN  ${msg}`),
  error: (msg: string): void => console.error(`${worker()} ERROR ${msg}`),
};
