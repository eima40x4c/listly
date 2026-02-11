import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { ItemService } from '@/services/item.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]/items
 * Get all items in a list
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { id: listId } = await params;
    const { searchParams } = new URL(request.url);
    const isChecked = searchParams.get('isChecked');
    const categoryId = searchParams.get('categoryId') || undefined;

    const itemService = new ItemService();
    const result = await itemService.getByList(listId, session.user.id, {
      isChecked:
        isChecked === 'true' ? true : isChecked === 'false' ? false : undefined,
      categoryId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch items' },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/lists/[id]/items
 * Add a new item to the list
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { id: listId } = await params;
    const body = await request.json();

    const itemService = new ItemService();
    const result = await itemService.create({
      listId,
      name: body.name,
      quantity: body.quantity || 1,
      unit: body.unit,
      categoryId: body.categoryId,
      estimatedPrice: body.estimatedPrice,
      notes: body.notes,
      priority: body.priority,
      addedById: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to create item' },
      },
      { status: 500 }
    );
  }
}
