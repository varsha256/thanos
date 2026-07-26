import 'dotenv/config';
import path from 'path';

/**
 * Supported logical environments. Select with the TEST_ENV env var (defaults to `qa`).
 * Any value can be overridden at runtime with UI_BASE_URL / API_BASE_URL.
 */
export type EnvName = 'dev' | 'qa' | 'prod';

export const ENV: EnvName = (process.env.TEST_ENV as EnvName) || 'qa';

const uiBaseUrls: Record<EnvName, string> = {
  dev: 'https://practicetestautomation.com',
  qa: 'https://practicetestautomation.com',
  prod: 'https://practicetestautomation.com',
};

const apiBaseUrls: Record<EnvName, string> = {
  dev: 'https://jsonplaceholder.typicode.com',
  qa: 'https://jsonplaceholder.typicode.com',
  prod: 'https://jsonplaceholder.typicode.com',
};

export const getUiBaseURL = (): string => process.env.UI_BASE_URL || uiBaseUrls[ENV];

export const getApiBaseURL = (): string => process.env.API_BASE_URL || apiBaseUrls[ENV];

/** Location of the persisted authenticated browser state produced by the `setup` project. */
export const STORAGE_STATE = path.resolve(__dirname, '../.auth/user.json');
