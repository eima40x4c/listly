/**
 * Meal Plan Validation Schemas
 *
 * Validation schemas for meal planning operations including
 * creation, updates, queries, and bulk operations.
 *
 * @module lib/validation/schemas/meal-plan
 */

import { z } from 'zod';

import { date, id, optionalText } from '../common';

/**
 * Create meal plan schema
 * - MealType: required, BREAKFAST/LUNCH/DINNER/SNACK
 * - Date: required, planned date
 * - RecipeId: optional, linked recipe
 * - Notes: optional, max 500 characters
 */
export const createMealPlanSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  date,
  recipeId: id.optional(),
  notes: optionalText(500),
});

/**
 * Update meal plan schema
 * - All fields are optional
 */
export const updateMealPlanSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
  date: date.optional(),
  recipeId: id.optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isCompleted: z.boolean().optional(),
});

/**
 * Meal plan query parameters schema
 * - StartDate: filter by start date
 * - EndDate: filter by end date
 * - MealType: filter by meal type
 * - IsCompleted: filter completed meals
 */
export const mealPlanQuerySchema = z
  .object({
    startDate: date.optional(),
    endDate: date.optional(),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
    isCompleted: z.coerce.boolean().optional(),
  })
  .refine(
    (data) => {
      // If both dates are provided, ensure endDate is after startDate
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

/**
 * Meal plan ID parameter schema
 * - For route parameters like /api/meal-plans/:id
 */
export const mealPlanIdParamSchema = z.object({
  id,
});

/**
 * Generate shopping list from meal plans schema
 * - StartDate: required, start of meal plan period
 * - EndDate: required, end of meal plan period
 * - MealTypes: optional, filter by meal types
 * - ListName: optional, custom list name
 */
export const generateShoppingListFromMealPlansSchema = z
  .object({
    startDate: date,
    endDate: date,
    mealTypes: z
      .array(z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']))
      .optional(),
    listName: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

/**
 * Bulk create meal plans schema
 * - MealPlans: array of meal plan objects
 */
export const bulkCreateMealPlansSchema = z.object({
  mealPlans: z
    .array(
      z.object({
        mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
        date,
        recipeId: id.optional(),
        notes: optionalText(500),
      })
    )
    .min(1, 'At least one meal plan is required'),
});

// Type exports
export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;
export type MealPlanQuery = z.infer<typeof mealPlanQuerySchema>;
export type MealPlanIdParam = z.infer<typeof mealPlanIdParamSchema>;
export type GenerateShoppingListFromMealPlansInput = z.infer<
  typeof generateShoppingListFromMealPlansSchema
>;
export type BulkCreateMealPlansInput = z.infer<
  typeof bulkCreateMealPlansSchema
>;
