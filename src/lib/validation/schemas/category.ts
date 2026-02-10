/**
 * Category Validation Schemas
 *
 * Validation schemas for category operations including
 * creation, updates, and queries.
 *
 * @module lib/validation/schemas/category
 */

import { z } from 'zod';

import {
  hexColor,
  id,
  nonNegativeInt,
  optionalText,
  requiredText,
  slug,
} from '../common';

/**
 * Create category schema
 * - Name: required, 1-100 characters
 * - Slug: required, URL-friendly slug
 * - Description: optional, max 500 characters
 * - Icon: optional, icon identifier
 * - Color: optional, hex color format
 * - SortOrder: optional, non-negative integer
 */
export const createCategorySchema = z.object({
  name: requiredText(1, 100, 'Category name'),
  slug,
  description: optionalText(500),
  icon: z.string().max(50).optional(),
  color: hexColor.optional(),
  sortOrder: nonNegativeInt.default(0),
});

/**
 * Update category schema
 * - All fields are optional
 * - Name: 1-100 characters
 * - Slug: URL-friendly slug
 */
export const updateCategorySchema = z.object({
  name: requiredText(1, 100, 'Category name').optional(),
  slug: slug.optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  color: hexColor.optional().nullable(),
  sortOrder: nonNegativeInt.optional(),
});

/**
 * Category query parameters schema
 * - IsDefault: filter default categories
 * - q: search query for name
 */
export const categoryQuerySchema = z.object({
  isDefault: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

/**
 * Category ID parameter schema
 * - For route parameters like /api/categories/:id
 */
export const categoryIdParamSchema = z.object({
  id,
});

/**
 * Reorder categories schema
 * - Categories: array of category IDs in desired order
 */
export const reorderCategoriesSchema = z.object({
  categories: z
    .array(
      z.object({
        id,
        sortOrder: nonNegativeInt,
      })
    )
    .min(1, 'At least one category is required'),
});

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
