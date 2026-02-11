/**
 * Collaboration Service Interface
 *
 * Defines the contract for list sharing and collaboration.
 * Handles invitations, permissions, and real-time synchronization.
 *
 * @module services/interfaces/collaboration-service.interface
 */

import type { CollaboratorRole, ListCollaborator } from '@prisma/client';

import type { IBaseService } from './base-service.interface';

/**
 * Input for sharing a list
 */
export interface IShareListInput {
  listId: string;
  ownerId: string;
  targetEmail: string;
  role?: CollaboratorRole;
  message?: string;
}

/**
 * Input for accepting an invitation
 */
export interface IAcceptInvitationInput {
  invitationCode: string;
  userId: string;
}

/**
 * Collaborator with user details
 */
export interface ICollaboratorWithUser extends ListCollaborator {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

/**
 * Activity log entry
 */
export interface IActivityEntry {
  id: string;
  action: 'ADDED' | 'CHECKED' | 'UNCHECKED' | 'UPDATED' | 'DELETED';
  itemName: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

/**
 * Invitation details
 */
export interface IInvitation {
  code: string;
  listId: string;
  listName: string;
  inviterName: string;
  role: CollaboratorRole;
  expiresAt: Date;
}

/**
 * Collaboration Service Interface
 */
export interface ICollaborationService extends IBaseService {
  /**
   * Share a list with another user
   */
  share(input: IShareListInput): Promise<void>;

  /**
   * Accept a list invitation
   */
  acceptInvitation(input: IAcceptInvitationInput): Promise<ListCollaborator>;

  /**
   * Remove a collaborator from a list
   */
  removeCollaborator(
    listId: string,
    ownerId: string,
    collaboratorId: string
  ): Promise<void>;

  /**
   * Update collaborator role
   */
  updateRole(
    listId: string,
    ownerId: string,
    collaboratorId: string,
    role: CollaboratorRole
  ): Promise<ListCollaborator>;

  /**
   * Leave a shared list
   */
  leaveList(listId: string, userId: string): Promise<void>;

  /**
   * Get all collaborators for a list
   */
  getCollaborators(
    listId: string,
    userId: string
  ): Promise<ICollaboratorWithUser[]>;

  /**
   * Get all lists shared with a user
   */
  getSharedLists(userId: string): Promise<any[]>;

  /**
   * Check if user has specific permission on list
   */
  hasPermission(
    listId: string,
    userId: string,
    permission: 'view' | 'edit' | 'admin'
  ): Promise<boolean>;

  /**
   * Get activity log for a list
   */
  getActivity(
    listId: string,
    userId: string,
    limit?: number
  ): Promise<IActivityEntry[]>;

  /**
   * Log an activity (for real-time sync)
   */
  logActivity(
    listId: string,
    userId: string,
    action: string,
    details: any
  ): Promise<void>;

  /**
   * Validate invitation code
   */
  validateInvitation(code: string): Promise<IInvitation | null>;

  /**
   * Generate invitation link
   */
  generateInvitationLink(listId: string, ownerId: string): Promise<string>;
}
