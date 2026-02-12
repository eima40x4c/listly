import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateStoreSchema } from '@/lib/validation/schemas/store';
import { validateBody } from '@/lib/validation/validate';
import { getStoreService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/stores/[id]
 * Get a store by ID
 */
export function GET(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, _user) => {
    const { id } = await params;

    const storeService = getStoreService();
    const result = await storeService.getById(id);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Store not found' },
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
 * PATCH /api/v1/stores/[id]
 * Update a store
 */
export function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, _user) => {
    const { id } = await params;

    // Validate request body
    const validation = await validateBody(req, updateStoreSchema);
    if (!validation.success) return validation.error;

    // Filter out null values
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== null)
    );

    const storeService = getStoreService();
    const result = await storeService.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * DELETE /api/v1/stores/[id]
 * Delete a store
 */
export function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, _user) => {
    const { id } = await params;

    const storeService = getStoreService();
    await storeService.delete(id);

    return new NextResponse(null, { status: 204 });
  })(request);
}
