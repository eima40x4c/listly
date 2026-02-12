import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { createListItemSchema } from '@/lib/validation/schemas/list-item';
import { validateBody } from '@/lib/validation/validate';
import { getItemService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]/items
 * Get all items in a list
 */
export function GET(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id: listId } = await params;
    const { searchParams } = new URL(req.url);
    const isChecked = searchParams.get('isChecked');

    const itemService = getItemService();
    // Service signature: getByList(listId, userId, includeChecked)
    // When isChecked param is 'false', we want includeChecked=false (hide checked items)
    // When isChecked is 'true' or null, we want includeChecked=true (show all)
    const includeChecked = isChecked !== 'false';
    const result = await itemService.getByList(listId, user.id, includeChecked);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * POST /api/v1/lists/[id]/items
 * Add a new item to the list
 */
export function POST(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id: listId } = await params;

    // Validate request body
    const validation = await validateBody(req, createListItemSchema);
    if (!validation.success) return validation.error;

    const data = validation.data;

    const itemService = getItemService();
    const result = await itemService.create({
      listId,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      categoryId: data.categoryId,
      estimatedPrice: data.estimatedPrice,
      notes: data.notes,
      priority: data.priority,
      addedById: user.id,
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
