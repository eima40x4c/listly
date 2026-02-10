/**
 * Pantry Item Validation Schemas
 *
 * Validation schemas for pantry inventory operations including
 * creation, updates, queries, and expiration tracking.
 *
 * @module lib/validation/schemas/pantry-item
 */

import { z } from 'zod';

import {
  date,
  id,
  optionalText,
  price,
  quantity,
  requiredText,
} from '../common';

/**
 * Create pantry item schema
 * - Name: required, 1-200 characters
 * - Quantity: optional, positive decimal (default: 1)
 * - Unit: optional, measurement unit
 * - Location: optional, storage location
 * - Barcode: optional, product barcode
 * - ExpirationDate: optional, future date
 * - PurchaseDate: optional, date
 * - PurchasePrice: optional, positive decimal
 * - CategoryId: optional, valid CUID
 * - Notes: optional, max 500 characters
 */
export const createPantryItemSchema = z.object({
  name: requiredText(1, 200, 'Item name'),
  quantity: quantity.default(1),
  unit: z.string().max(20).optional(),
  location: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  expirationDate: date.optional(),
  purchaseDate: date.optional(),
  purchasePrice: price.optional(),
  categoryId: id.optional(),
  notes: optionalText(500),
});

/**
 * Update pantry item schema
 * - All fields are optional
 * - Name: 1-200 characters
 * - Quantity: positive decimal
 * - IsConsumed: boolean
 */
export const updatePantryItemSchema = z.object({
  name: requiredText(1, 200, 'Item name').optional(),
  quantity: quantity.optional(),
  unit: z.string().max(20).optional().nullable(),
  location: z.string().max(50).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  expirationDate: date.optional().nullable(),
  purchaseDate: date.optional().nullable(),
  purchasePrice: price.optional().nullable(),
  categoryId: id.optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isConsumed: z.boolean().optional(),
});

/**
 * Pantry item query parameters schema
 * - CategoryId: filter by category
 * - Location: filter by storage location
 * - IsConsumed: filter consumed items
 * - ExpiringBefore: filter items expiring before date
 * - Barcode: search by barcode
 * - q: search query for item name
 */
export const pantryItemQuerySchema = z.object({
  categoryId: id.optional(),
  location: z.string().optional(),
  isConsumed: z.coerce.boolean().optional(),
  expiringBefore: date.optional(),
  barcode: z.string().optional(),
  q: z.string().optional(),
});

/**
 * Pantry item ID parameter schema
 * - For route parameters like /api/pantry/:id
 */
export const pantryItemIdParamSchema = z.object({
  id,
});

/**
 * Bulk consume items schema
 * - ItemIds: array of item IDs to mark as consumed
 */
export const bulkConsumePantryItemsSchema = z.object({
  itemIds: z.array(id).min(1, 'At least one item ID is required'),
});

// Type exports
export type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>;
export type UpdatePantryItemInput = z.infer<typeof updatePantryItemSchema>;
export type PantryItemQuery = z.infer<typeof pantryItemQuerySchema>;
export type PantryItemIdParam = z.infer<typeof pantryItemIdParamSchema>;
export type BulkConsumePantryItemsInput = z.infer<
  typeof bulkConsumePantryItemsSchema
>;
