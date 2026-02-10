/**
 * User Validation Schemas
 *
 * Validation schemas for user-related operations including
 * registration, login, profile updates, and preferences.
 *
 * @module lib/validation/schemas/user
 */

import { z } from 'zod';

import { email, id, name, password } from '../common';

/**
 * User registration schema
 * - Email (required, validated)
 * - Password (required, strong password rules)
 * - Name (required, 1-100 characters)
 */
export const registerSchema = z.object({
  email,
  password,
  name,
});

/**
 * User login schema
 * - Email (required, validated)
 * - Password (required, any non-empty string for login)
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Update user profile schema
 * - All fields are optional
 * - Name: 1-100 characters
 * - Email: valid email format
 * - AvatarUrl: valid URL
 */
export const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

/**
 * Update user preferences schema
 * - All fields are optional
 * - DefaultBudgetWarning: positive number with 2 decimal places
 * - DefaultCurrency: 3-character currency code
 * - Theme: light, dark, or system
 */
export const updatePreferencesSchema = z.object({
  defaultBudgetWarning: z.coerce
    .number()
    .positive('Budget warning must be positive')
    .multipleOf(0.01, 'Budget can have at most 2 decimal places')
    .optional(),
  defaultCurrency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional(),
  notificationsEnabled: z.coerce.boolean().optional(),
  locationReminders: z.coerce.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

/**
 * Change password schema
 * - CurrentPassword: required
 * - NewPassword: required, strong password rules
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: password,
});

/**
 * User ID parameter schema
 * - For route parameters like /api/users/:id
 */
export const userIdParamSchema = z.object({
  id,
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
