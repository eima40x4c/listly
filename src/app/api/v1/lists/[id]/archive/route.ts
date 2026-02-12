import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { getListService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/v1/lists/[id]/archive
 * Archive a list
 */
export function POST(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, user) => {
    const { id } = await params;

    const listService = getListService();
    const result = await listService.archive(id, user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}
