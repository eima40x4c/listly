/**
 * Logging Utility
 *
 * Simple structured logging for development and production.
 * Logs are formatted as JSON for easy parsing by log aggregators (Sentry, Datadog, etc.).
 *
 * In development, logs are pretty-printed for readability.
 * In production, logs are single-line JSON for efficient processing.
 *
 * @module lib/logger
 */

/**
 * Log severity levels.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Additional structured data to include in log entries.
 */
interface LogData {
  [key: string]: unknown;
}

/**
 * Log a message with structured data.
 *
 * @param level - Log severity level
 * @param message - Human-readable log message
 * @param data - Additional structured data (optional)
 */
/* eslint-disable no-console */
function log(level: LogLevel, message: string, data?: LogData): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  // In development, pretty print for readability
  if (process.env.NODE_ENV === 'development') {
    const levelEmoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };

    console[level](
      `${levelEmoji[level]} [${timestamp}] ${message}`,
      data ? `\n${JSON.stringify(data, null, 2)}` : ''
    );
  } else {
    // In production, single line JSON for log aggregators
    console[level](JSON.stringify(logEntry));
  }
}

/**
 * Logger instance with methods for each log level.
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err.message });
 * logger.warn('Rate limit approaching', { requests: 950, limit: 1000 });
 * logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
 * ```
 */
export const logger = {
  /**
   * Log debug information (verbose, development only).
   *
   * @param message - Debug message
   * @param data - Additional context
   */
  debug: (message: string, data?: LogData): void => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, data);
    }
  },

  /**
   * Log informational message (general application events).
   *
   * @param message - Info message
   * @param data - Additional context
   */
  info: (message: string, data?: LogData): void => {
    log('info', message, data);
  },

  /**
   * Log warning message (potential issues, deprecations).
   *
   * @param message - Warning message
   * @param data - Additional context
   */
  warn: (message: string, data?: LogData): void => {
    log('warn', message, data);
  },

  /**
   * Log error message (exceptions, failures).
   *
   * @param message - Error message
   * @param data - Additional context (error details, stack trace, etc.)
   */
  error: (message: string, data?: LogData): void => {
    log('error', message, data);
  },
};
