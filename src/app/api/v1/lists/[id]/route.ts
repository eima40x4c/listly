import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { ListService } from '@/services/list.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]
 * Get a specific list by ID
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include')?.split(',') || [];

    const listService = new ListService();
    const result =
      include.length > 0
        ? await listService.getByIdWithDetails(id, session.user.id)
        : await listService.getById(id, session.user.id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: { message: 'List not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch list' },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/lists/[id]
 * Update a specific list
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

    const { id } = await params;
    const body = await request.json();

    const listService = new ListService();
    const result = await listService.update(id, session.user.id, body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to update list' },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/lists/[id]
 * Delete a specific list
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

    const { id } = await params;

    const listService = new ListService();
    await listService.delete(id, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to delete list' },
      },
      { status: 500 }
    );
  }
}
