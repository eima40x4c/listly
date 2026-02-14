import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateRecipeSchema } from '@/lib/validation/schemas/recipe';
import { validateBody } from '@/lib/validation/validate';
import { getRecipeService } from '@/services';

/**
 * GET /api/v1/recipes/[id]
 * Get a specific recipe
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  const recipeService = getRecipeService();
  const recipe = await recipeService.getByIdWithDetails(id, user.id);

  if (!recipe) {
    return NextResponse.json(
      { success: false, error: 'Recipe not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: recipe,
  });
});

/**
 * PATCH /api/v1/recipes/[id]
 * Update a recipe
 */
export const PATCH = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  // Validate request body
  const validation = await validateBody(request, updateRecipeSchema);
  if (!validation.success) return validation.error;

  const data = validation.data;

  const recipeService = getRecipeService();
  const updatedRecipe = await recipeService.update(id, user.id, data);

  return NextResponse.json({
    success: true,
    data: updatedRecipe,
  });
});

/**
 * DELETE /api/v1/recipes/[id]
 * Delete a recipe
 */
export const DELETE = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  const recipeService = getRecipeService();
  await recipeService.delete(id, user.id);

  return NextResponse.json({
    success: true,
    data: null,
  });
});
