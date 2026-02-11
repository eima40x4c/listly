/**
 * Collaboration Service Implementation
 *
 * Business logic for list sharing and collaboration.
 * Handles invitations, permissions, and activity tracking.
 *
 * @module services/collaboration.service
 */

import type { CollaboratorRole, ListCollaborator } from '@prisma/client';
import type { ShoppingList } from '@prisma/client';
import { randomBytes } from 'crypto';

import { prisma } from '@/lib/db';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';

import type {
  IAcceptInvitationInput,
  IActivityEntry,
  ICollaborationService,
  ICollaboratorWithUser,
  IInvitation,
  IShareListInput,
} from './interfaces';

// Business rules
const MAX_COLLABORATORS_PER_LIST = 10;
const _INVITATION_EXPIRY_DAYS = 7;

export class CollaborationService implements ICollaborationService {
  readonly serviceName = 'CollaborationService';

  /**
   * Share a list with another user
   */
  async share(input: IShareListInput): Promise<void> {
    // Verify ownership
    const list = await prisma.shoppingList.findUnique({
      where: { id: input.listId },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== input.ownerId) {
      throw new ForbiddenError('Only the list owner can share this list');
    }

    // Check collaborator limit
    const collaboratorCount = await prisma.listCollaborator.count({
      where: { listId: input.listId },
    });

    if (collaboratorCount >= MAX_COLLABORATORS_PER_LIST) {
      throw new ValidationError(
        `Maximum collaborators reached (${MAX_COLLABORATORS_PER_LIST})`
      );
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email: input.targetEmail },
    });

    if (!targetUser) {
      // TODO: Send invitation email to non-existent user
      throw new NotFoundError(
        'User not found. Email invitation feature coming soon.'
      );
    }

    // Check if already a collaborator
    const existing = await prisma.listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId: input.listId,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      throw new ValidationError('User is already a collaborator on this list');
    }

    // Add collaborator
    await prisma.listCollaborator.create({
      data: {
        listId: input.listId,
        userId: targetUser.id,
        role: input.role || 'EDITOR',
      },
    });

    // TODO: Send notification email
  }

  /**
   * Accept a list invitation
   */
  async acceptInvitation(
    _input: IAcceptInvitationInput
  ): Promise<ListCollaborator> {
    // For now, invitations are handled via direct share
    // This will be expanded when invitation system is fully implemented
    throw new Error('Invitation system not yet implemented');
  }

  /**
   * Remove a collaborator
   */
  async removeCollaborator(
    listId: string,
    ownerId: string,
    collaboratorId: string
  ): Promise<void> {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== ownerId) {
      throw new ForbiddenError('Only the list owner can remove collaborators');
    }

    await prisma.listCollaborator.delete({
      where: {
        listId_userId: {
          listId,
          userId: collaboratorId,
        },
      },
    });
  }

  /**
   * Update collaborator role
   */
  async updateRole(
    listId: string,
    ownerId: string,
    collaboratorId: string,
    role: CollaboratorRole
  ): Promise<ListCollaborator> {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== ownerId) {
      throw new ForbiddenError(
        'Only the list owner can update collaborator roles'
      );
    }

    return prisma.listCollaborator.update({
      where: {
        listId_userId: {
          listId,
          userId: collaboratorId,
        },
      },
      data: { role },
    });
  }

  /**
   * Leave a shared list
   */
  async leaveList(listId: string, userId: string): Promise<void> {
    const collaborator = await prisma.listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId,
          userId,
        },
      },
    });

    if (!collaborator) {
      throw new NotFoundError('You are not a collaborator on this list');
    }

    await prisma.listCollaborator.delete({
      where: {
        listId_userId: {
          listId,
          userId,
        },
      },
    });
  }

  /**
   * Get all collaborators for a list
   */
  async getCollaborators(
    listId: string,
    userId: string
  ): Promise<ICollaboratorWithUser[]> {
    // Verify access
    const hasAccess = await this.hasPermission(listId, userId, 'view');
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    const collaborators = await prisma.listCollaborator.findMany({
      where: { listId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Map null to undefined for avatarUrl
    return collaborators.map((collab) => ({
      ...collab,
      user: {
        ...collab.user,
        avatarUrl: collab.user.avatarUrl ?? undefined,
      },
    }));
  }

  /**
   * Get all lists shared with user
   */
  async getSharedLists(userId: string): Promise<ShoppingList[]> {
    const collaborations = await prisma.listCollaborator.findMany({
      where: { userId },
      include: {
        list: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return collaborations.map((c) => ({
      ...c.list,
      role: c.role,
      joinedAt: c.joinedAt,
    }));
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    listId: string,
    userId: string,
    permission: 'view' | 'edit' | 'admin'
  ): Promise<boolean> {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: {
        collaborators: {
          where: { userId },
        },
      },
    });

    if (!list) {
      return false;
    }

    // Owner has all permissions
    if (list.ownerId === userId) {
      return true;
    }

    // Check collaborator role
    const collaborator = list.collaborators[0];
    if (!collaborator) {
      return false;
    }

    switch (permission) {
      case 'view':
        return ['VIEWER', 'EDITOR', 'ADMIN'].includes(collaborator.role);
      case 'edit':
        return ['EDITOR', 'ADMIN'].includes(collaborator.role);
      case 'admin':
        return collaborator.role === 'ADMIN';
      default:
        return false;
    }
  }

  /**
   * Get activity log
   */
  async getActivity(
    listId: string,
    userId: string,
    limit = 50
  ): Promise<IActivityEntry[]> {
    const hasAccess = await this.hasPermission(listId, userId, 'view');
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    // Get recent item history
    const history = await prisma.itemHistory.findMany({
      where: { item: { listId } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        item: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return history.map((h) => ({
      id: h.id,
      action: 'CHECKED' as const,
      itemName: h.item?.name || 'Unknown Item',
      userId: h.userId,
      userName: h.user.name,
      timestamp: h.createdAt,
    }));
  }

  /**
   * Log activity
   */
  async logActivity(
    _listId: string,
    _userId: string,
    _action: string,
    _details: Record<string, unknown>
  ): Promise<void> {
    // This will be implemented when real-time sync is added
    // For now, activity is tracked through ItemHistory
  }

  /**
   * Validate invitation
   */
  async validateInvitation(_code: string): Promise<IInvitation | null> {
    // Invitation system to be implemented
    return null;
  }

  /**
   * Generate invitation link
   */
  async generateInvitationLink(
    listId: string,
    ownerId: string
  ): Promise<string> {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== ownerId) {
      throw new ForbiddenError(
        'Only the list owner can generate invitation links'
      );
    }

    // Generate invitation code
    const code = randomBytes(16).toString('hex');

    // TODO: Store invitation in database with expiry

    return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${code}`;
  }
}
