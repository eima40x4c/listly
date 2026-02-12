import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateCategorySchema } from '@/lib/validation/schemas/category';
import { validateBody } from '@/lib/validation/validate';
import { getCategoryService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/categories/[id]
 * Get a specific category
 */
export function GET(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, _user) => {
    const { id } = await params;

    const categoryService = getCategoryService();
    // Note: CategoryService doesn't have getById, using getBySlug with id
    const result = await categoryService.getBySlug(id);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * PATCH /api/v1/categories/[id]
 * Update a category
 */
export function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, _user) => {
    const { id } = await params;

    // Validate request body
    const validation = await validateBody(req, updateCategorySchema);
    if (!validation.success) return validation.error;

    // Filter out null values (convert to undefined for service)
    const data = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== null)
    );

    const categoryService = getCategoryService();
    const result = await categoryService.update(id, data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * DELETE /api/v1/categories/[id]
 * Delete a category
 */
export function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, _user) => {
    const { id } = await params;

    const categoryService = getCategoryService();
    await categoryService.delete(id);

    return new NextResponse(null, { status: 204 });
  })(request);
}
