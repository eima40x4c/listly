import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateCollaboratorRoleSchema } from '@/lib/validation/schemas/collaborator';
import { validateBody } from '@/lib/validation/validate';
import { getCollaborationService } from '@/services';

interface RouteParams {
  params: Promise<{
    id: string;
    userId: string;
  }>;
}

/**
 * PATCH /api/v1/lists/[id]/collaborators/[userId]
 * Update a collaborator's role
 */
export function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (req, user) => {
    const { id: listId, userId: collaboratorId } = await params;

    // Validate request body
    const validation = await validateBody(req, updateCollaboratorRoleSchema);
    if (!validation.success) return validation.error;

    const collaborationService = getCollaborationService();
    const result = await collaborationService.updateRole(
      listId,
      user.id,
      collaboratorId,
      validation.data.role
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * DELETE /api/v1/lists/[id]/collaborators/[userId]
 * Remove a collaborator from a list
 */
export function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuthAndErrorHandling(async (_req, user) => {
    const { id: listId, userId: collaboratorId } = await params;

    const collaborationService = getCollaborationService();
    await collaborationService.removeCollaborator(
      listId,
      user.id,
      collaboratorId
    );

    return new NextResponse(null, { status: 204 });
  })(request);
}
