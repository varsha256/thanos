import { envConfig } from './env.config';

/** Shared timeout constants for UI waits and API calls. */
export const Timeouts: {
  readonly short: number;
  readonly medium: number;
  readonly long: number;
  readonly navigation: number;
  readonly toast: number;
  readonly networkIdle: number;
} = {
  short: 5_000,
  medium: 15_000,
  long: envConfig.defaultTimeoutMs,
  navigation: envConfig.navigationTimeoutMs,
  toast: 8_000,
  networkIdle: 10_000,
};
