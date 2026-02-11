import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { StoreService } from '@/services/store.service';

/**
 * GET /api/v1/stores
 * Get all stores
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = searchParams.get('search') || undefined;

    const storeService = new StoreService();
    const result = await storeService.getAll({
      page,
      limit,
      search,
    });

    return NextResponse.json({
      success: true,
      data: result.stores,
      meta: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch stores' },
      },
      { status: 500 }
    );
  }
}
