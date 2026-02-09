/**
 * Password Security Utilities
 *
 * Provides secure password hashing and verification using bcryptjs.
 * Never store plain text passwords - always hash with bcrypt.
 *
 * @module lib/auth/password
 */

import { compare, hash } from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt hashing.
 * Higher values = more secure but slower.
 * 12 rounds is a good balance for 2026.
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt.
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 *
 * @example
 * ```ts
 * const hashed = await hashPassword('SecurePass123!');
 * // Store hashed in database
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed password.
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to true if passwords match
 *
 * @example
 * ```ts
 * const isValid = await verifyPassword('SecurePass123!', user.passwordHash);
 * if (isValid) {
 *   // Login successful
 * }
 * ```
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
