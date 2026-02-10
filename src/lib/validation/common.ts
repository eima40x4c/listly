/**
 * Common Validation Schemas
 *
 * Reusable validation schemas for common field types across the application.
 * These schemas provide consistent validation rules and error messages.
 *
 * @module lib/validation/common
 */

import { z } from 'zod';

/**
 * CUID (Collision-resistant Unique ID) validation
 * Used for all entity IDs in the system
 */
export const id = z.string().cuid('Invalid ID format');

/**
 * Email validation with normalization
 * - Validates email format
 * - Converts to lowercase
 * - Trims whitespace
 */
export const email = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Password validation for registration
 * - Minimum 8 characters
 * - Must contain uppercase, lowercase, and number
 */
export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  );

/**
 * Generic name validation
 * - Required, non-empty
 * - Maximum 100 characters
 * - Trims whitespace
 */
export const name = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim();

/**
 * URL slug validation
 * - Lowercase letters, numbers, and hyphens only
 * - Used for category slugs, etc.
 */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

/**
 * Positive integer validation with coercion
 * - Converts string to number
 * - Must be a whole number
 * - Must be positive
 */
export const positiveInt = z.coerce
  .number()
  .int('Must be a whole number')
  .positive('Must be positive');

/**
 * Non-negative integer validation with coercion
 * - Converts string to number
 * - Must be a whole number
 * - Must be zero or positive
 */
export const nonNegativeInt = z.coerce
  .number()
  .int('Must be a whole number')
  .min(0, 'Cannot be negative');

/**
 * Price/currency validation with coercion
 * - Positive decimal number
 * - Maximum 2 decimal places
 * - Used for prices, budgets, costs
 */
export const price = z.coerce
  .number()
  .positive('Price must be positive')
  .multipleOf(0.01, 'Price can have at most 2 decimal places');

/**
 * Optional price/currency validation
 * - Same as price but nullable
 */
export const optionalPrice = z.coerce
  .number()
  .positive('Price must be positive')
  .multipleOf(0.01, 'Price can have at most 2 decimal places')
  .nullable()
  .optional();

/**
 * Quantity validation with coercion
 * - Positive decimal number (allows fractional quantities)
 * - Used for item quantities
 */
export const quantity = z.coerce
  .number()
  .positive('Quantity must be positive')
  .multipleOf(0.01, 'Quantity can have at most 2 decimal places');

/**
 * URL validation
 * - Must be valid URL format
 */
export const url = z.string().url('Invalid URL');

/**
 * Date validation with coercion
 * - Converts string/number to Date object
 */
export const date = z.coerce.date();

/**
 * Boolean validation with coercion
 * - Converts various values to boolean
 * - Handles "true"/"false" strings, 0/1, etc.
 */
export const boolean = z.coerce.boolean();

/**
 * Hex color validation
 * - Must be 6-character hex color (#RRGGBB)
 */
export const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

/**
 * Latitude validation
 * - Must be between -90 and 90
 */
export const latitude = z.coerce
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

/**
 * Longitude validation
 * - Must be between -180 and 180
 */
export const longitude = z.coerce
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

/**
 * ISO 8601 date-time string validation
 * - Used for date-time values in API responses
 */
export const isoDateTime = z.string().datetime();

/**
 * Optional text field with max length
 * Creates a nullable/optional string with max length validation
 */
export const optionalText = (maxLength: number) =>
  z
    .string()
    .max(maxLength, `Text too long (max ${maxLength} characters)`)
    .optional();

/**
 * Required text field with min/max length
 * Creates a required string with length validation
 */
export const requiredText = (
  minLength: number,
  maxLength: number,
  fieldName = 'Text'
) =>
  z
    .string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} too long (max ${maxLength} characters)`)
    .trim();
