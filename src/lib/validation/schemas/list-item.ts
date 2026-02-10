/**
 * List Item Validation Schemas
 *
 * Validation schemas for shopping list item operations including
 * creation, updates, bulk operations, and queries.
 *
 * @module lib/validation/schemas/list-item
 */

import { z } from 'zod';

import {
  id,
  nonNegativeInt,
  optionalText,
  price,
  quantity,
  requiredText,
} from '../common';

/**
 * Create list item schema
 * - Name: required, 1-200 characters
 * - Quantity: optional, positive decimal (default: 1)
 * - Unit: optional, measurement unit
 * - Notes: optional, max 500 characters
 * - CategoryId: optional, valid CUID
 * - EstimatedPrice: optional, positive decimal
 * - Priority: optional, integer (default: 0)
 */
export const createListItemSchema = z.object({
  name: requiredText(1, 200, 'Item name'),
  quantity: quantity.default(1),
  unit: z.string().max(20).optional(),
  notes: optionalText(500),
  categoryId: id.optional(),
  estimatedPrice: price.optional(),
  priority: nonNegativeInt.default(0),
});

/**
 * Update list item schema
 * - All fields are optional
 * - Name: 1-200 characters
 * - Quantity: positive decimal
 * - IsChecked: boolean
 * - Priority: non-negative integer
 */
export const updateListItemSchema = z.object({
  name: requiredText(1, 200, 'Item name').optional(),
  quantity: quantity.optional(),
  unit: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  categoryId: id.optional().nullable(),
  estimatedPrice: price.optional().nullable(),
  priority: nonNegativeInt.optional(),
  isChecked: z.boolean().optional(),
});

/**
 * Bulk check items schema
 * - ItemIds: array of item IDs to check/uncheck
 * - IsChecked: boolean indicating checked state
 */
export const bulkCheckItemsSchema = z.object({
  itemIds: z.array(id).min(1, 'At least one item ID is required'),
  isChecked: z.boolean(),
});

/**
 * Reorder items schema
 * - Items: array of item IDs in desired order
 */
export const reorderItemsSchema = z.object({
  items: z
    .array(
      z.object({
        id,
        sortOrder: nonNegativeInt,
      })
    )
    .min(1, 'At least one item is required'),
});

/**
 * Add items from template schema
 * - TemplateId: valid shopping list ID (must be a template)
 */
export const addItemsFromTemplateSchema = z.object({
  templateId: id,
  includeCheckedItems: z.boolean().default(false),
});

/**
 * List item query parameters schema
 * - CategoryId: filter by category
 * - IsChecked: filter by checked status
 * - q: search query for item name
 */
export const listItemQuerySchema = z.object({
  categoryId: id.optional(),
  isChecked: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

/**
 * List item ID parameter schema
 * - For route parameters like /api/lists/:listId/items/:id
 */
export const listItemIdParamSchema = z.object({
  id,
});

// Type exports
export type CreateListItemInput = z.infer<typeof createListItemSchema>;
export type UpdateListItemInput = z.infer<typeof updateListItemSchema>;
export type BulkCheckItemsInput = z.infer<typeof bulkCheckItemsSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
export type AddItemsFromTemplateInput = z.infer<
  typeof addItemsFromTemplateSchema
>;
export type ListItemQuery = z.infer<typeof listItemQuerySchema>;
export type ListItemIdParam = z.infer<typeof listItemIdParamSchema>;
