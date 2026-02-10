/**
 * Custom Application Error Classes
 *
 * Provides structured error handling with consistent error codes,
 * HTTP status codes, and user-friendly messages.
 *
 * @module lib/errors/AppError
 */

import type { ErrorCode } from './codes';
import { ErrorCodes } from './codes';

/**
 * Base application error class.
 *
 * Extends native Error with structured error information including
 * error code, HTTP status, and optional details (e.g., validation errors).
 *
 * @example
 * ```ts
 * throw new AppError(
 *   'VALIDATION_ERROR',
 *   'Invalid email format',
 *   400,
 *   { field: 'email', message: 'Must be a valid email' }
 * );
 * ```
 */
export class AppError extends Error {
  /**
   * @param code - Machine-readable error code
   * @param message - User-friendly error message
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Additional context (validation errors, etc.)
   */
  /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    /* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */
    super(message);
    this.name = 'AppError';

    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format.
   *
   * @returns Object ready for JSON serialization
   */
  toJSON() {
    const result: { error: ErrorCode; message: string; details?: unknown } = {
      error: this.code,
      message: this.message,
    };

    if (this.details) {
      result.details = this.details;
    }

    return result;
  }
}

// ============================================================================
// Convenience Subclasses (4xx Client Errors)
// ============================================================================

/**
 * Validation error (400 Bad Request).
 *
 * Use for invalid request data, malformed JSON, or failed schema validation.
 *
 * @example
 * ```ts
 * throw new ValidationError('Invalid request data', [
 *   { field: 'email', message: 'Invalid email format' },
 *   { field: 'password', message: 'Too short' }
 * ]);
 * ```
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Invalid request data', details?: unknown) {
    super(ErrorCodes.VALIDATION_ERROR, message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized error (401 Unauthorized).
 *
 * Use when authentication is required but not provided or invalid.
 *
 * @example
 * ```ts
 * throw new UnauthorizedError(); // Default message
 * throw new UnauthorizedError('Invalid token');
 * ```
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(ErrorCodes.UNAUTHORIZED, message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error (403 Forbidden).
 *
 * Use when user is authenticated but lacks permission for the resource.
 *
 * @example
 * ```ts
 * throw new ForbiddenError(); // Default message
 * throw new ForbiddenError('You do not have permission to edit this list');
 * ```
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(ErrorCodes.FORBIDDEN, message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not found error (404 Not Found).
 *
 * Use when the requested resource does not exist.
 *
 * @example
 * ```ts
 * throw new NotFoundError(); // "Resource not found"
 * throw new NotFoundError('Shopping list'); // "Shopping list not found"
 * ```
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (409 Conflict).
 *
 * Use when a resource already exists (e.g., duplicate email).
 *
 * @example
 * ```ts
 * throw new ConflictError('Email already registered');
 * throw new ConflictError('Item already checked');
 * ```
 */
export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCodes.CONFLICT) {
    super(code, message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error (429 Too Many Requests).
 *
 * Use when the client exceeds request rate limits.
 *
 * @example
 * ```ts
 * throw new RateLimitError();
 * throw new RateLimitError('Try again in 60 seconds');
 * ```
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(ErrorCodes.RATE_LIMITED, message, 429);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Server Error Subclasses (5xx)
// ============================================================================

/**
 * Internal server error (500 Internal Server Error).
 *
 * Use for unexpected errors that should not expose implementation details.
 *
 * @example
 * ```ts
 * throw new InternalError(); // Default message
 * throw new InternalError('Configuration error');
 * ```
 */
export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super(ErrorCodes.INTERNAL_ERROR, message, 500);
    this.name = 'InternalError';
  }
}

/**
 * Database error (500 Internal Server Error).
 *
 * Use when a database operation fails (connection, query, etc.).
 *
 * @example
 * ```ts
 * throw new DatabaseError('Failed to connect to database');
 * ```
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'A database error occurred') {
    super(ErrorCodes.DATABASE_ERROR, message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * External service error (502 Bad Gateway).
 *
 * Use when a third-party API or service call fails.
 *
 * @example
 * ```ts
 * throw new ExternalServiceError('Payment gateway unavailable');
 * throw new ExternalServiceError('AI service timeout');
 * ```
 */
export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service unavailable') {
    super(ErrorCodes.EXTERNAL_SERVICE_ERROR, message, 502);
    this.name = 'ExternalServiceError';
  }
}
