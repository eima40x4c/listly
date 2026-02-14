import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import {
  createMealPlanSchema,
  mealPlanQuerySchema,
} from '@/lib/validation/schemas/meal-plan';
import { validateBody, validateQuery } from '@/lib/validation/validate';
import { getMealPlanService } from '@/services';

/**
 * GET /api/v1/meal-plans
 * Get meal plans for the current user
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = await validateQuery(
    searchParams,
    mealPlanQuerySchema
  );
  if (!queryValidation.success) return queryValidation.error;

  const filters = queryValidation.data;

  const mealPlanService = getMealPlanService();
  const result = await mealPlanService.getByUser(user.id, filters);

  return NextResponse.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

/**
 * POST /api/v1/meal-plans
 * Create a new meal plan
 */
export const POST = withAuthAndErrorHandling(async (request, user) => {
  // Validate request body
  const validation = await validateBody(request, createMealPlanSchema);
  if (!validation.success) return validation.error;

  const data = validation.data;

  const mealPlanService = getMealPlanService();
  const result = await mealPlanService.create(user.id, data);

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 201 }
  );
});
