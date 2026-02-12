/**
 * Collaboration Repository Implementation
 *
 * Data access layer for list collaboration operations.
 * Encapsulates all Prisma queries for list collaborators.
 *
 * @module repositories/collaboration.repository
 */

import type {
  CollaboratorRole,
  ListCollaborator,
  Prisma,
  PrismaClient,
} from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  CollaborationWithList,
  CollaboratorWithUser,
  ICollaborationRepository,
} from './interfaces';

export class CollaborationRepository
  extends BaseRepository<ListCollaborator>
  implements ICollaborationRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new collaborator
   */
  async create(
    data: Prisma.ListCollaboratorCreateInput
  ): Promise<ListCollaborator> {
    return (this.db as PrismaClient).listCollaborator.create({ data });
  }

  /**
   * Find a collaborator by ID
   */
  async findById(id: string): Promise<ListCollaborator | null> {
    return (this.db as PrismaClient).listCollaborator.findUnique({
      where: { id },
    });
  }

  /**
   * Find a specific list-user collaboration
   */
  async findByListAndUser(
    listId: string,
    userId: string
  ): Promise<ListCollaborator | null> {
    return (this.db as PrismaClient).listCollaborator.findUnique({
      where: {
        listId_userId: {
          listId,
          userId,
        },
      },
    });
  }

  /**
   * Update a collaborator's role
   */
  async updateRole(
    id: string,
    role: CollaboratorRole
  ): Promise<ListCollaborator> {
    return (this.db as PrismaClient).listCollaborator.update({
      where: { id },
      data: { role },
    });
  }

  /**
   * Delete a collaborator
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).listCollaborator.delete({
      where: { id },
    });
  }

  /**
   * Find all collaborators for a list
   */
  async findByList(listId: string): Promise<CollaboratorWithUser[]> {
    return (this.db as PrismaClient).listCollaborator.findMany({
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
  }

  /**
   * Find all lists a user collaborates on
   */
  async findByUser(userId: string): Promise<CollaborationWithList[]> {
    return (this.db as PrismaClient).listCollaborator.findMany({
      where: { userId },
      include: {
        list: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * Count collaborators on a list
   */
  async countByList(listId: string): Promise<number> {
    return (this.db as PrismaClient).listCollaborator.count({
      where: { listId },
    });
  }

  /**
   * Check if user is a collaborator on a list
   */
  async isCollaborator(listId: string, userId: string): Promise<boolean> {
    const collaborator = await this.findByListAndUser(listId, userId);
    return collaborator !== null;
  }

  /**
   * Get user's role on a list
   */
  async getRole(
    listId: string,
    userId: string
  ): Promise<CollaboratorRole | null> {
    const collaborator = await this.findByListAndUser(listId, userId);
    return collaborator?.role || null;
  }

  /**
   * Find a list with its collaborators for permission check
   */
  async findListWithCollaborators(
    listId: string,
    userId: string
  ): Promise<{
    ownerId: string;
    collaborator: { role: CollaboratorRole } | null;
  } | null> {
    const list = await (this.db as PrismaClient).shoppingList.findUnique({
      where: { id: listId },
      select: {
        ownerId: true,
        collaborators: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
    });

    if (!list) {
      return null;
    }

    return {
      ownerId: list.ownerId,
      collaborator: list.collaborators[0] || null,
    };
  }

  /**
   * Get item history for a list
   */
  async getItemHistory(
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
  > {
    const history = await (this.db as PrismaClient).itemHistory.findMany({
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
      userId: h.userId,
      userName: h.user.name,
      itemName: h.item?.name || 'Unknown Item',
      createdAt: h.createdAt,
    }));
  }
}
