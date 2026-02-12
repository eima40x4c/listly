/**
 * Collaboration Repository Interface
 *
 * Data access contract for list collaboration operations.
 *
 * @module repositories/interfaces/collaboration-repository.interface
 */

import type {
  CollaboratorRole,
  ListCollaborator,
  Prisma,
} from '@prisma/client';

import type { IBaseRepository } from './base-repository.interface';

/**
 * Collaborator with user details
 */
export type CollaboratorWithUser = ListCollaborator & {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

/**
 * Collaboration with list details
 */
export type CollaborationWithList = ListCollaborator & {
  list: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    owner: {
      id: string;
      name: string;
    };
  };
};

/**
 * Collaboration Repository Interface
 */
export interface ICollaborationRepository extends IBaseRepository<ListCollaborator> {
  /**
   * Create a new collaborator
   */
  create(data: Prisma.ListCollaboratorCreateInput): Promise<ListCollaborator>;

  /**
   * Find a collaborator by ID
   */
  findById(id: string): Promise<ListCollaborator | null>;

  /**
   * Find a specific list-user collaboration
   */
  findByListAndUser(
    listId: string,
    userId: string
  ): Promise<ListCollaborator | null>;

  /**
   * Update a collaborator's role
   */
  updateRole(id: string, role: CollaboratorRole): Promise<ListCollaborator>;

  /**
   * Delete a collaborator
   */
  delete(id: string): Promise<void>;

  /**
   * Find all collaborators for a list
   */
  findByList(listId: string): Promise<CollaboratorWithUser[]>;

  /**
   * Find all lists a user collaborates on
   */
  findByUser(userId: string): Promise<CollaborationWithList[]>;

  /**
   * Count collaborators on a list
   */
  countByList(listId: string): Promise<number>;

  /**
   * Check if user is a collaborator on a list
   */
  isCollaborator(listId: string, userId: string): Promise<boolean>;

  /**
   * Get user's role on a list
   */
  getRole(listId: string, userId: string): Promise<CollaboratorRole | null>;

  /**
   * Find a list with its collaborators for permission check
   */
  findListWithCollaborators(
    listId: string,
    userId: string
  ): Promise<{
    ownerId: string;
    collaborator: { role: CollaboratorRole } | null;
  } | null>;

  /**
   * Get item history for a list
   */
  getItemHistory(
    listId: string,
    limit: number
  ): Promise<
    Array<{
      id: string;
      userId: string;
      userName: string | null;
      itemName: string;
      createdAt: Date;
    }>
  >;
}
