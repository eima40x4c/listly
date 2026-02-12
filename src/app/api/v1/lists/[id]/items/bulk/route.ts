import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { createListItemSchema } from '@/lib/validation/schemas/list-item';
import { validateBody } from '@/lib/validation/validate';
import { getItemService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const bulkCreateSchema = z.object({
  items: z.array(createListItemSchema).min(1).max(100),
});

/**
 * POST /api/v1/lists/[id]/items/bulk
 * Bulk create items
 */
export function POST(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id: listId } = await params;

    // Validate request body
    const validation = await validateBody(req, bulkCreateSchema);
    if (!validation.success) return validation.error;

    const itemService = getItemService();
    const result = await itemService.createMany({
      listId,
      addedById: user.id,
      items: validation.data.items,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  })(request);
}
