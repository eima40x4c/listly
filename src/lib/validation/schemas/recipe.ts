/**
 * Recipe Validation Schemas
 *
 * Validation schemas for recipe operations including
 * creation, updates, queries, and ingredient management.
 *
 * @module lib/validation/schemas/recipe
 */

import { z } from 'zod';

import {
  id,
  nonNegativeInt,
  optionalText,
  quantity,
  requiredText,
  url,
} from '../common';

/**
 * Recipe ingredient schema
 * - Name: required, 1-200 characters
 * - Quantity: positive decimal
 * - Unit: optional, measurement unit
 * - Notes: optional, max 200 characters
 * - SortOrder: optional, non-negative integer
 */
export const recipeIngredientSchema = z.object({
  name: requiredText(1, 200, 'Ingredient name'),
  quantity,
  unit: z.string().max(20).optional(),
  notes: z.string().max(200).optional(),
  sortOrder: nonNegativeInt.default(0),
});

/**
 * Create recipe schema
 * - Title: required, 1-200 characters
 * - Description: optional, max 1000 characters
 * - Instructions: required, text content
 * - Ingredients: optional, array of ingredients
 * - PrepTime: optional, minutes
 * - CookTime: optional, minutes
 * - Servings: optional, positive integer
 * - Difficulty: optional, easy/medium/hard
 * - Cuisine: optional, cuisine type
 * - ImageUrl: optional, valid URL
 * - SourceUrl: optional, valid URL
 * - IsPublic: optional, boolean
 */
export const createRecipeSchema = z.object({
  title: requiredText(1, 200, 'Recipe title'),
  description: optionalText(1000),
  instructions: z.string().min(1, 'Instructions are required'),
  ingredients: z.array(recipeIngredientSchema).optional(),
  prepTime: nonNegativeInt.optional(),
  cookTime: nonNegativeInt.optional(),
  servings: nonNegativeInt.optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  cuisine: z.string().max(50).optional(),
  imageUrl: url.optional(),
  sourceUrl: url.optional(),
  isPublic: z.boolean().default(false),
});

/**
 * Update recipe schema
 * - All fields are optional
 */
export const updateRecipeSchema = z.object({
  title: requiredText(1, 200, 'Recipe title').optional(),
  description: z.string().max(1000).optional().nullable(),
  instructions: z.string().min(1, 'Instructions are required').optional(),
  prepTime: nonNegativeInt.optional().nullable(),
  cookTime: nonNegativeInt.optional().nullable(),
  servings: nonNegativeInt.optional().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().nullable(),
  cuisine: z.string().max(50).optional().nullable(),
  imageUrl: url.optional().nullable(),
  sourceUrl: url.optional().nullable(),
  isPublic: z.boolean().optional(),
});

/**
 * Recipe query parameters schema
 * - Cuisine: filter by cuisine type
 * - Difficulty: filter by difficulty
 * - MaxTime: filter by total time (prep + cook)
 * - IsPublic: filter public recipes
 * - q: search query for title/description
 */
export const recipeQuerySchema = z.object({
  cuisine: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  maxTime: nonNegativeInt.optional(),
  isPublic: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

/**
 * Recipe ID parameter schema
 * - For route parameters like /api/recipes/:id
 */
export const recipeIdParamSchema = z.object({
  id,
});

/**
 * Generate shopping list from recipe schema
 * - RecipeIds: array of recipe IDs
 * - Servings: optional, adjust quantities for servings
 */
export const generateShoppingListFromRecipesSchema = z.object({
  recipeIds: z.array(id).min(1, 'At least one recipe ID is required'),
  servings: nonNegativeInt.optional(),
  listName: requiredText(1, 200, 'List name').optional(),
});

// Type exports
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
export type RecipeIdParam = z.infer<typeof recipeIdParamSchema>;
export type GenerateShoppingListFromRecipesInput = z.infer<
  typeof generateShoppingListFromRecipesSchema
>;
