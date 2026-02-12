import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { validateBody } from '@/lib/validation/validate';
import { getItemService } from '@/services';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

const checkItemSchema = z.object({
  actualPrice: z.number().optional(),
});

/**
 * POST /api/v1/items/[itemId]/check
 * Check/uncheck an item
 */
export function POST(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { itemId } = await params;

    // Validate request body
    const validation = await validateBody(req, checkItemSchema);
    if (!validation.success) return validation.error;

    const itemService = getItemService();
    const result = await itemService.toggleCheck(
      itemId,
      user.id,
      validation.data
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}
