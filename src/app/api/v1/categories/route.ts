import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { createCategorySchema } from '@/lib/validation/schemas/category';
import { validateBody } from '@/lib/validation/validate';
import { getCategoryService } from '@/services';

/**
 * GET /api/v1/categories
 * Get all categories (defaults + usage stats for user)
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  const categoryService = getCategoryService();

  // If search query provided, use search
  if (q) {
    const result = await categoryService.search(q);
    return NextResponse.json({
      success: true,
      data: result,
    });
  }

  // Otherwise return usage stats which includes default categories
  const result = await categoryService.getUsageStats(user.id);
  return NextResponse.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/v1/categories
 * Create a new category
 */
export const POST = withAuthAndErrorHandling(async (request, _user) => {
  // Validate request body
  const validation = await validateBody(request, createCategorySchema);
  if (!validation.success) return validation.error;

  const categoryService = getCategoryService();
  const result = await categoryService.create(validation.data);

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 201 }
  );
});
