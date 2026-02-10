/**
 * Store Validation Schemas
 *
 * Validation schemas for store operations including
 * creation, updates, queries, and store-specific categories.
 *
 * @module lib/validation/schemas/store
 */

import { z } from 'zod';

import {
  id,
  latitude,
  longitude,
  nonNegativeInt,
  requiredText,
} from '../common';

/**
 * Create store schema
 * - Name: required, 1-200 characters
 * - Chain: optional, store chain name
 * - Address: optional, store address
 * - Latitude: optional, -90 to 90
 * - Longitude: optional, -180 to 180
 */
export const createStoreSchema = z.object({
  name: requiredText(1, 200, 'Store name'),
  chain: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
});

/**
 * Update store schema
 * - All fields are optional
 * - Name: 1-200 characters
 * - Chain: max 100 characters
 * - Address: max 500 characters
 */
export const updateStoreSchema = z.object({
  name: requiredText(1, 200, 'Store name').optional(),
  chain: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  latitude: latitude.optional().nullable(),
  longitude: longitude.optional().nullable(),
});

/**
 * Store query parameters schema
 * - Chain: filter by chain name
 * - Near: filter by proximity (lat,lng format)
 * - q: search query for name/chain/address
 */
export const storeQuerySchema = z.object({
  chain: z.string().optional(),
  near: z
    .string()
    .regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Must be in format: lat,lng')
    .optional(),
  radius: z.coerce.number().positive().max(100).default(10).optional(), // km
  q: z.string().optional(),
});

/**
 * Store ID parameter schema
 * - For route parameters like /api/stores/:id
 */
export const storeIdParamSchema = z.object({
  id,
});

/**
 * Create store category mapping schema
 * - CategoryId: required, valid CUID
 * - AisleNumber: optional, aisle identifier
 * - CustomName: optional, store-specific category name
 * - SortOrder: optional, non-negative integer
 */
export const createStoreCategorySchema = z.object({
  categoryId: id,
  aisleNumber: z.string().max(20).optional(),
  customName: z.string().max(100).optional(),
  sortOrder: nonNegativeInt.default(0),
});

/**
 * Update store category mapping schema
 * - All fields are optional
 */
export const updateStoreCategorySchema = z.object({
  aisleNumber: z.string().max(20).optional().nullable(),
  customName: z.string().max(100).optional().nullable(),
  sortOrder: nonNegativeInt.optional(),
});

/**
 * Reorder store categories schema
 * - Categories: array of category IDs in desired order
 */
export const reorderStoreCategoriesSchema = z.object({
  categories: z
    .array(
      z.object({
        categoryId: id,
        sortOrder: nonNegativeInt,
      })
    )
    .min(1, 'At least one category is required'),
});

// Type exports
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreQuery = z.infer<typeof storeQuerySchema>;
export type StoreIdParam = z.infer<typeof storeIdParamSchema>;
export type CreateStoreCategoryInput = z.infer<
  typeof createStoreCategorySchema
>;
export type UpdateStoreCategoryInput = z.infer<
  typeof updateStoreCategorySchema
>;
export type ReorderStoreCategoriesInput = z.infer<
  typeof reorderStoreCategoriesSchema
>;
