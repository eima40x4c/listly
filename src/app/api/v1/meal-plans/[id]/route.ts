import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateMealPlanSchema } from '@/lib/validation/schemas/meal-plan';
import { validateBody } from '@/lib/validation/validate';
import { getMealPlanService } from '@/services';

/**
 * GET /api/v1/meal-plans/[id]
 * Get a specific meal plan
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  const mealPlanService = getMealPlanService();
  const mealPlan = await mealPlanService.getByIdWithDetails(id, user.id);

  if (!mealPlan) {
    return NextResponse.json(
      { success: false, error: 'Meal plan not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: mealPlan,
  });
});

/**
 * PATCH /api/v1/meal-plans/[id]
 * Update a meal plan
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
  const validation = await validateBody(request, updateMealPlanSchema);
  if (!validation.success) return validation.error;

  const data = validation.data;

  const mealPlanService = getMealPlanService();
  const updatedMealPlan = await mealPlanService.update(id, user.id, data);

  return NextResponse.json({
    success: true,
    data: updatedMealPlan,
  });
});

/**
 * DELETE /api/v1/meal-plans/[id]
 * Delete a meal plan
 */
export const DELETE = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  const mealPlanService = getMealPlanService();
  await mealPlanService.delete(id, user.id);

  return NextResponse.json({
    success: true,
    data: null,
  });
});
