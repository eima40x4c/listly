import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { addCollaboratorSchema } from '@/lib/validation/schemas/collaborator';
import { validateBody } from '@/lib/validation/validate';
import { getCollaborationService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]/collaborators
 * Get all collaborators for a list
 */
export function GET(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, user) => {
    const { id: listId } = await params;

    const collaborationService = getCollaborationService();
    const result = await collaborationService.getCollaborators(listId, user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * POST /api/v1/lists/[id]/collaborators
 * Add a collaborator to a list
 */
export function POST(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id: listId } = await params;

    // Validate request body
    const validation = await validateBody(req, addCollaboratorSchema);
    if (!validation.success) return validation.error;

    const collaborationService = getCollaborationService();
    await collaborationService.share({
      listId,
      ownerId: user.id,
      targetEmail: validation.data.email,
      role: validation.data.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Collaborator invited successfully',
      },
      { status: 201 }
    );
  })(request);
}
