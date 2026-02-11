import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { ListService } from '@/services/list.service';

/**
 * GET /api/v1/lists
 * Get all lists for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const listService = new ListService();
    const result = await listService.getByUser(session.user.id, {
      status: status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch lists' },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/lists
 * Create a new shopping list
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    const listService = new ListService();
    const result = await listService.create(session.user.id, {
      name: body.name,
      description: body.description,
      budget: body.budget,
      storeId: body.storeId,
      color: body.color,
      icon: body.icon,
      isTemplate: body.isTemplate || false,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to create list' },
      },
      { status: 500 }
    );
  }
}
