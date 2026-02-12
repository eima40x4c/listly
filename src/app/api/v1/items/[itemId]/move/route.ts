import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { id } from '@/lib/validation/common';
import { validateBody } from '@/lib/validation/validate';
import { getItemService } from '@/services';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

const moveItemSchema = z.object({
  targetListId: id,
});

/**
 * PATCH /api/v1/items/[itemId]/move
 * Move an item to another list
 */
export function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { itemId } = await params;

    // Validate request body
    const validation = await validateBody(req, moveItemSchema);
    if (!validation.success) return validation.error;

    const itemService = getItemService();
    const result = await itemService.moveToList(
      itemId,
      user.id,
      validation.data.targetListId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}
