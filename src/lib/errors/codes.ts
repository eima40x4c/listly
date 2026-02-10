/**
 * Error Code Constants
 *
 * Machine-readable error codes used throughout the application.
 * Each error code maps to a specific HTTP status code and user-facing message.
 *
 * @module lib/errors/codes
 */

/**
 * Standard error codes used across the application.
 *
 * Categorized by type:
 * - Client errors (4xx): User input or authentication issues
 * - Business errors (422): Business logic violations
 * - Server errors (5xx): Internal server or external service failures
 */
export const ErrorCodes = {
  // ============================================================================
  // Client Errors (4xx)
  // ============================================================================

  /**
   * Invalid request data (malformed JSON, missing fields, validation failures).
   * HTTP 400
   */
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  /**
   * Authentication required but not provided or invalid.
   * HTTP 401
   */
  UNAUTHORIZED: 'UNAUTHORIZED',

  /**
   * Authenticated but insufficient permissions for the requested resource.
   * HTTP 403
   */
  FORBIDDEN: 'FORBIDDEN',

  /**
   * Requested resource does not exist.
   * HTTP 404
   */
  NOT_FOUND: 'NOT_FOUND',

  /**
   * Resource already exists (duplicate email, unique constraint violation).
   * HTTP 409
   */
  CONFLICT: 'CONFLICT',

  /**
   * Too many requests from this client.
   * HTTP 429
   */
  RATE_LIMITED: 'RATE_LIMITED',

  // ============================================================================
  // Business Logic Errors (422)
  // ============================================================================

  /**
   * Email address is already registered.
   * HTTP 409
   */
  EMAIL_EXISTS: 'EMAIL_EXISTS',

  /**
   * Insufficient stock to fulfill order.
   * HTTP 422
   */
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',

  /**
   * Payment processing failed.
   * HTTP 422
   */
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  /**
   * Cannot perform operation on cancelled order.
   * HTTP 422
   */
  ORDER_CANCELLED: 'ORDER_CANCELLED',

  /**
   * Item has already been checked/completed.
   * HTTP 409
   */
  ITEM_ALREADY_CHECKED: 'ITEM_ALREADY_CHECKED',

  /**
   * Cannot delete a list that contains items.
   * HTTP 422
   */
  LIST_NOT_EMPTY: 'LIST_NOT_EMPTY',

  // ============================================================================
  // Server Errors (5xx)
  // ============================================================================

  /**
   * Unexpected internal server error.
   * HTTP 500
   */
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  /**
   * Generic server error (deprecated, use INTERNAL_ERROR).
   * HTTP 500
   */
  SERVER_ERROR: 'SERVER_ERROR',

  /**
   * Database operation failed (connection, query, constraint).
   * HTTP 500
   */
  DATABASE_ERROR: 'DATABASE_ERROR',

  /**
   * External service or API call failed.
   * HTTP 502
   */
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * TypeScript type for error codes.
 * Use this type for function parameters and return values.
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
