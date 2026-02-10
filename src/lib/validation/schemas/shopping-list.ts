/**
 * Shopping List Validation Schemas
 *
 * Validation schemas for shopping list operations including
 * creation, updates, queries, and status changes.
 *
 * @module lib/validation/schemas/shopping-list
 */

import { z } from 'zod';

import { hexColor, id, optionalText, price, requiredText } from '../common';

/**
 * Create shopping list schema
 * - Name: required, 1-200 characters
 * - Description: optional, max 500 characters
 * - Budget: optional, positive decimal
 * - StoreId: optional, valid CUID
 * - Color: optional, hex color format
 * - Icon: optional, icon identifier
 * - IsTemplate: optional, boolean
 */
export const createShoppingListSchema = z.object({
  name: requiredText(1, 200, 'List name'),
  description: optionalText(500),
  budget: price.optional(),
  storeId: id.optional(),
  color: hexColor.optional(),
  icon: z.string().max(50).optional(),
  isTemplate: z.boolean().default(false),
});

/**
 * Update shopping list schema
 * - All fields are optional
 * - Name: 1-200 characters
 * - Description: max 500 characters
 * - Budget: positive decimal or null to remove
 * - Status: ACTIVE, COMPLETED, or ARCHIVED
 * - StoreId: valid CUID or null to remove
 */
export const updateShoppingListSchema = z.object({
  name: requiredText(1, 200, 'List name').optional(),
  description: z.string().max(500).optional().nullable(),
  budget: price.optional().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  color: hexColor.optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  storeId: id.optional().nullable(),
});

/**
 * Shopping list query parameters schema
 * - Status: filter by list status
 * - StoreId: filter by store
 * - IsTemplate: filter templates
 * - q: search query for name/description
 */
export const shoppingListQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  storeId: id.optional(),
  isTemplate: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

/**
 * Shopping list ID parameter schema
 * - For route parameters like /api/lists/:id
 */
export const shoppingListIdParamSchema = z.object({
  id,
});

/**
 * Duplicate shopping list schema
 * - NewName: optional, uses "{original name} (Copy)" if not provided
 */
export const duplicateShoppingListSchema = z.object({
  newName: requiredText(1, 200, 'List name').optional(),
  includeCheckedItems: z.boolean().default(false),
});

// Type exports
export type CreateShoppingListInput = z.infer<typeof createShoppingListSchema>;
export type UpdateShoppingListInput = z.infer<typeof updateShoppingListSchema>;
export type ShoppingListQuery = z.infer<typeof shoppingListQuerySchema>;
export type ShoppingListIdParam = z.infer<typeof shoppingListIdParamSchema>;
export type DuplicateShoppingListInput = z.infer<
  typeof duplicateShoppingListSchema
>;
