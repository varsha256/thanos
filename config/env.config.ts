/**
 * Central environment configuration.
 * Values resolve from process.env with safe defaults for local/CI runs.
 */
export type EnvironmentName = 'local' | 'qa' | 'staging' | 'prod';

export interface EnvConfig {
  readonly name: EnvironmentName;
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly defaultTimeoutMs: number;
  readonly navigationTimeoutMs: number;
  readonly credentials: {
    readonly email: string;
    readonly password: string;
  };
}

function resolveEnvName(raw: string | undefined): EnvironmentName {
  const value = (raw ?? 'qa').toLowerCase();
  if (value === 'local' || value === 'qa' || value === 'staging' || value === 'prod') {
    return value;
  }
  return 'qa';
}

export const envConfig: EnvConfig = {
  name: resolveEnvName(process.env.ENV_NAME),
  baseUrl: process.env.BASE_URL ?? 'https://food-app.example.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.food-app.example.com',
  defaultTimeoutMs: Number(process.env.DEFAULT_TIMEOUT_MS ?? 30_000),
  navigationTimeoutMs: Number(process.env.NAVIGATION_TIMEOUT_MS ?? 45_000),
  credentials: {
    email: process.env.TEST_USER_EMAIL ?? 'customer@example.com',
    password: process.env.TEST_USER_PASSWORD ?? 'ChangeMe123!',
  },
};
