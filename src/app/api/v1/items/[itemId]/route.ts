import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateListItemSchema } from '@/lib/validation/schemas/list-item';
import { validateBody } from '@/lib/validation/validate';
import { getItemService } from '@/services';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

/**
 * PATCH /api/v1/items/[itemId]
 * Update an item
 */
export function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { itemId } = await params;

    // Validate request body
    const validation = await validateBody(req, updateListItemSchema);
    if (!validation.success) return validation.error;

    // Filter out null values
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== null)
    );

    const itemService = getItemService();
    const result = await itemService.update(itemId, user.id, updateData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * DELETE /api/v1/items/[itemId]
 * Delete an item
 */
export function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, user) => {
    const { itemId } = await params;

    const itemService = getItemService();
    await itemService.delete(itemId, user.id);

    return new NextResponse(null, { status: 204 });
  })(request);
}
