import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { ItemService } from '@/services/item.service';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

/**
 * PATCH /api/v1/items/[itemId]
 * Update an item
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    const body = await request.json();

    const itemService = new ItemService();
    const result = await itemService.update(itemId, session.user.id, body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to update item' },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/items/[itemId]
 * Delete an item
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { itemId } = await params;

    const itemService = new ItemService();
    await itemService.delete(itemId, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to delete item' },
      },
      { status: 500 }
    );
  }
}
