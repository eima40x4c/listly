import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateShoppingListSchema } from '@/lib/validation/schemas/shopping-list';
import { validateBody } from '@/lib/validation/validate';
import { getListService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]
 * Get a specific list by ID
 */
export function GET(_request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const include = searchParams.get('include')?.split(',') || [];

    const listService = getListService();
    const result =
      include.length > 0
        ? await listService.getByIdWithDetails(id, user.id)
        : await listService.getById(id, user.id);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'List not found' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(_request);
}

/**
 * PATCH /api/v1/lists/[id]
 * Update a specific list
 */
export function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id } = await params;

    // Validate request body
    const validation = await validateBody(req, updateShoppingListSchema);
    if (!validation.success) return validation.error;

    // Filter out null values
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== null)
    );

    const listService = getListService();
    const result = await listService.update(id, user.id, updateData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * DELETE /api/v1/lists/[id]
 * Delete a specific list
 */
export function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, user) => {
    const { id } = await params;

    const listService = getListService();
    await listService.delete(id, user.id);

    return new NextResponse(null, { status: 204 });
  })(request);
}
