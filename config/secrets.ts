import 'dotenv/config';

/**
 * Centralised access to secrets. Values are read from environment variables
 * (loaded from a local `.env` file via dotenv, or injected by CI / Cursor Secrets).
 *
 * NEVER hard-code real credentials here. The fallbacks below point at the public
 * practice site (https://practicetestautomation.com) purely so the example suite runs
 * out of the box.
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required secret: ${name}. Add it to your .env file or CI secrets.`);
  }
  return value;
}

export const credentials = {
  username: required('APP_USERNAME', 'student'),
  password: required('APP_PASSWORD', 'Password123'),
};

/** Example bearer token for authenticated API calls (optional). */
export const apiToken = process.env.API_TOKEN ?? '';
