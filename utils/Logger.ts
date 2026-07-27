export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'STEP' | 'API';

export interface ApiLogPayload {
  url: string;
  method: string;
  headers?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
  status?: number;
  responseTimeMs?: number;
}

/**
 * Structured logger for enterprise Playwright suites.
 * Emits timestamped, level-tagged messages suitable for CI log aggregation.
 */
export class Logger {
  private readonly context: string;

  constructor(context = 'Framework') {
    this.context = context;
  }

  info(message: string, data?: unknown): void {
    this.write('INFO', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.write('WARN', message, data);
  }

  error(message: string, data?: unknown): void {
    this.write('ERROR', message, data);
  }

  step(message: string, data?: unknown): void {
    this.write('STEP', message, data);
  }

  api(message: string, payload: ApiLogPayload): void {
    this.write('API', message, {
      url: payload.url,
      method: payload.method,
      headers: this.sanitizeHeaders(payload.headers),
      payload: payload.requestBody,
      response: payload.responseBody,
      status: payload.status,
      responseTimeMs: payload.responseTimeMs,
    });
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }

  private write(level: LogLevel, message: string, data?: unknown): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(data !== undefined ? { data } : {}),
    };

    const line = `[${entry.timestamp}] [${level}] [${this.context}] ${message}`;
    if (level === 'ERROR') {
      console.error(line, data !== undefined ? data : '');
    } else if (level === 'WARN') {
      console.warn(line, data !== undefined ? data : '');
    } else {
      console.log(line, data !== undefined ? data : '');
    }

    // Structured JSON line for log collectors (Datadog, Splunk, CloudWatch)
    if (process.env.STRUCTURED_LOGS === 'true') {
      console.log(JSON.stringify(entry));
    }
  }

  private sanitizeHeaders(
    headers?: Record<string, string>,
  ): Record<string, string> | undefined {
    if (!headers) {
      return undefined;
    }

    const sensitive = ['authorization', 'cookie', 'x-api-key', 'set-cookie'];
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [
        key,
        sensitive.includes(key.toLowerCase()) ? '***REDACTED***' : value,
      ]),
    );
  }
}

export const logger = new Logger('CheckoutAutomation');
