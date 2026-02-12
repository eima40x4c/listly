/**
 * Collaboration Service Implementation
 *
 * Business logic for list sharing and collaboration.
 * Handles invitations, permissions, and activity tracking.
 *
 * @module services/collaboration.service
 */

import type { CollaboratorRole, ListCollaborator } from '@prisma/client';
import { randomBytes } from 'crypto';

import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';
import {
  CollaborationRepository,
  ListRepository,
  UserRepository,
} from '@/repositories';

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

  private collabRepo: CollaborationRepository;
  private listRepo: ListRepository;
  private userRepo: UserRepository;

  constructor() {
    this.collabRepo = new CollaborationRepository();
    this.listRepo = new ListRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Share a list with another user
   */
  async share(input: IShareListInput): Promise<void> {
    // Verify ownership
    const list = await this.listRepo.findById(input.listId);

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== input.ownerId) {
      throw new ForbiddenError('Only the list owner can share this list');
    }

    // Check collaborator limit
    const collaboratorCount = await this.collabRepo.countByList(input.listId);

    if (collaboratorCount >= MAX_COLLABORATORS_PER_LIST) {
      throw new ValidationError(
        `Maximum collaborators reached (${MAX_COLLABORATORS_PER_LIST})`
      );
    }

    // Find target user
    const targetUser = await this.userRepo.findByEmail(input.targetEmail);

    if (!targetUser) {
      // TODO: Send invitation email to non-existent user
      throw new NotFoundError(
        'User not found. Email invitation feature coming soon.'
      );
    }

    // Check if already a collaborator
    const existing = await this.collabRepo.findByListAndUser(
      input.listId,
      targetUser.id
    );

    if (existing) {
      throw new ValidationError('User is already a collaborator on this list');
    }

    // Add collaborator
    await this.collabRepo.create({
      list: { connect: { id: input.listId } },
      user: { connect: { id: targetUser.id } },
      role: input.role || 'EDITOR',
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
    const list = await this.listRepo.findById(listId);

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== ownerId) {
      throw new ForbiddenError('Only the list owner can remove collaborators');
    }

    const collab = await this.collabRepo.findByListAndUser(
      listId,
      collaboratorId
    );
    if (!collab) {
      throw new NotFoundError('Collaborator not found');
    }

    await this.collabRepo.delete(collab.id);
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
    const list = await this.listRepo.findById(listId);

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (list.ownerId !== ownerId) {
      throw new ForbiddenError(
        'Only the list owner can update collaborator roles'
      );
    }

    const collab = await this.collabRepo.findByListAndUser(
      listId,
      collaboratorId
    );
    if (!collab) {
      throw new NotFoundError('Collaborator not found');
    }

    return this.collabRepo.updateRole(collab.id, role);
  }

  /**
   * Leave a shared list
   */
  async leaveList(listId: string, userId: string): Promise<void> {
    const collaborator = await this.collabRepo.findByListAndUser(
      listId,
      userId
    );

    if (!collaborator) {
      throw new NotFoundError('You are not a collaborator on this list');
    }

    await this.collabRepo.delete(collaborator.id);
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

    const collaborators = await this.collabRepo.findByList(listId);

    return collaborators as ICollaboratorWithUser[];
  }

  /**
   * Get all lists shared with user
   */
  async getSharedLists(userId: string): Promise<unknown[]> {
    return this.collabRepo.findByUser(userId);
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    listId: string,
    userId: string,
    permission: 'view' | 'edit' | 'admin'
  ): Promise<boolean> {
    const result = await this.collabRepo.findListWithCollaborators(
      listId,
      userId
    );

    if (!result) {
      return false;
    }

    // Owner has all permissions
    if (result.ownerId === userId) {
      return true;
    }

    // Check collaborator role
    const collaborator = result.collaborator;
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

    // Get recent item history via repository
    const history = await this.collabRepo.getItemHistory(listId, limit);

    return history.map((h) => ({
      id: h.id,
      action: 'CHECKED' as const,
      itemName: h.itemName,
      userId: h.userId,
      userName: h.userName || 'Unknown User',
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
    const list = await this.listRepo.findById(listId);

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
