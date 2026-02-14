import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import {
  createRecipeSchema,
  recipeQuerySchema,
} from '@/lib/validation/schemas/recipe';
import { validateBody, validateQuery } from '@/lib/validation/validate';
import { getRecipeService } from '@/services';

/**
 * GET /api/v1/recipes
 * Get recipes for the current user
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = await validateQuery(searchParams, recipeQuerySchema);
  if (!queryValidation.success) return queryValidation.error;

  const filters = queryValidation.data;

  const recipeService = getRecipeService();
  const result = await recipeService.getByUser(user.id, filters);

  return NextResponse.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

/**
 * POST /api/v1/recipes
 * Create a new recipe
 */
export const POST = withAuthAndErrorHandling(async (request, user) => {
  // Validate request body
  const validation = await validateBody(request, createRecipeSchema);
  if (!validation.success) return validation.error;

  const data = {
    ...validation.data,
    isPublic: validation.data.isPublic ?? false,
    ingredients: validation.data.ingredients?.map((ing) => ({
      ...ing,
      sortOrder: ing.sortOrder ?? 0,
    })),
  };

  const recipeService = getRecipeService();
  const result = await recipeService.create(user.id, data);

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 201 }
  );
});
