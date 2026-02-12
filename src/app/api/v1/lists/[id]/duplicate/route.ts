import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { validateBody } from '@/lib/validation/validate';
import { getListService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const duplicateListSchema = z.object({
  name: z.string().min(1).optional(),
});

/**
 * POST /api/v1/lists/[id]/duplicate
 * Duplicate a list
 */
export function POST(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id } = await params;

    // Validate request body
    const validation = await validateBody(req, duplicateListSchema);
    if (!validation.success) return validation.error;

    const listService = getListService();
    const result = await listService.duplicate(
      id,
      user.id,
      validation.data.name || 'Copy'
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  })(request);
}
