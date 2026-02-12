import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { getStoreService } from '@/services';

/**
 * GET /api/v1/stores
 * Get all stores
 */
export const GET = withAuthAndErrorHandling(async (request, _user) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const search = searchParams.get('search') || undefined;

  const storeService = getStoreService();
  const result = await storeService.getAll({
    page,
    limit,
    search,
  });

  return NextResponse.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});
