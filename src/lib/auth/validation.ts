/**
 * Authentication Validation Utilities
 *
 * Provides password strength scoring for UI feedback.
 *
 * NOTE: Password and email format validation is handled by Zod schemas in
 * `@/lib/validation/common` (password, email) and `@/lib/validation/schemas/user`
 * (registerSchema, loginSchema, changePasswordSchema). Use those schemas for
 * all server-side and form validation. This module only provides the password
 * strength scorer for UI display purposes.
 *
 * @module lib/auth/validation
 */

/**
 * Get password strength score (0-4) for UI display.
 *
 * This is NOT a validation function — use the Zod `password` schema from
 * `@/lib/validation/common` for actual validation.
 *
 * Scoring:
 * - 0: Very weak (< 8 characters)
 * - 1: Weak (8+ characters)
 * - 2: Fair (12+ characters or mixed case)
 * - 3: Good (mixed case + numbers)
 * - 4: Strong (mixed case + numbers + special characters)
 *
 * @param password - Password to score
 * @returns Score from 0 (very weak) to 4 (very strong)
 *
 * @example
 * ```ts
 * import { getPasswordStrength } from '@/lib/auth/validation';
 *
 * const score = getPasswordStrength(passwordInput);
 * // Display strength meter in UI
 * ```
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
