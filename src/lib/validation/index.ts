/**
 * Validation Module
 *
 * Central export point for all validation schemas and utilities.
 * Import validation schemas and functions from this module.
 *
 * @module lib/validation
 *
 * @example
 * ```ts
 * import {
 *   validateBody,
 *   createListSchema,
 *   paginationSchema,
 * } from '@/lib/validation';
 * ```
 */

// Common schemas
export * from './common';
export * from './pagination';
export * from './validate';

// Resource schemas
export * from './schemas/category';
export * from './schemas/collaborator';
export * from './schemas/list-item';
export * from './schemas/meal-plan';
export * from './schemas/pantry-item';
export * from './schemas/recipe';
export * from './schemas/shopping-list';
export * from './schemas/store';
export * from './schemas/user';
