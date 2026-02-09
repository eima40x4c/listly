/**
 * Authentication Validation Utilities
 *
 * Provides password strength validation and other auth-related validation rules.
 *
 * @module lib/auth/validation
 */

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional: Special characters allowed but not required
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Email validation regex (basic format check)
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate password meets security requirements.
 *
 * @param password - Password to validate
 * @returns true if password meets requirements
 *
 * @example
 * ```ts
 * if (!validatePassword('weak')) {
 *   throw new Error('Password does not meet requirements');
 * }
 * ```
 */
export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

/**
 * Validate email format.
 *
 * @param email - Email to validate
 * @returns true if email format is valid
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Get password strength score (0-4).
 *
 * @param password - Password to score
 * @returns Score from 0 (very weak) to 4 (very strong)
 */
export function getPasswordStrength(password: string): number {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  return Math.min(score, 4);
}
