/**
 * List Repository Implementation
 *
 * Data access layer for shopping list operations.
 * Encapsulates all Prisma queries for shopping lists.
 *
 * @module repositories/list.repository
 */

import type { Prisma, PrismaClient, ShoppingList } from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  IListRepository,
  ListWithItems,
  QueryOptions,
} from './interfaces';

export class ListRepository
  extends BaseRepository<ShoppingList>
  implements IListRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new shopping list
   */
  async create(data: Prisma.ShoppingListCreateInput): Promise<ShoppingList> {
    return (this.db as PrismaClient).shoppingList.create({ data });
  }

  /**
   * Find a list by ID
   */
  async findById(id: string): Promise<ShoppingList | null> {
    return (this.db as PrismaClient).shoppingList.findUnique({
      where: { id },
    });
  }

  /**
   * Find a list by ID with all related data
   */
  async findByIdWithDetails(id: string): Promise<ListWithItems | null> {
    return (this.db as PrismaClient).shoppingList.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
            isChecked: true,
            categoryId: true,
            estimatedPrice: true,
            sortOrder: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        collaborators: {
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
        },
        store: {
          select: {
            id: true,
            name: true,
            chain: true,
          },
        },
      },
    });
  }

  /**
   * Update a shopping list
   */
  async update(
    id: string,
    data: Prisma.ShoppingListUpdateInput
  ): Promise<ShoppingList> {
    return (this.db as PrismaClient).shoppingList.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a shopping list
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).shoppingList.delete({
      where: { id },
    });
  }

  /**
   * Find lists owned by a user
   */
  async findByOwner(
    ownerId: string,
    options: QueryOptions = {}
  ): Promise<ShoppingList[]> {
    const {
      skip = 0,
      take = 50,
      orderBy = 'updatedAt',
      order = 'desc',
    } = options;

    return (this.db as PrismaClient).shoppingList.findMany({
      where: { ownerId },
      skip,
      take,
      orderBy: { [orderBy]: order },
    });
  }

  /**
   * Find lists shared with a user
   */
  async findSharedWithUser(userId: string): Promise<ShoppingList[]> {
    return (this.db as PrismaClient).shoppingList.findMany({
      where: {
        collaborators: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Count lists owned by a user
   */
  async countByOwner(ownerId: string): Promise<number> {
    return (this.db as PrismaClient).shoppingList.count({
      where: { ownerId },
    });
  }

  /**
   * Check if user has access to a list (owner or collaborator)
   */
  async hasAccess(listId: string, userId: string): Promise<boolean> {
    const list = await (this.db as PrismaClient).shoppingList.findFirst({
      where: {
        id: listId,
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      },
    });
    return list !== null;
  }

  /**
   * Check if user is the owner of a list
   */
  async isOwner(listId: string, userId: string): Promise<boolean> {
    const list = await (this.db as PrismaClient).shoppingList.findFirst({
      where: {
        id: listId,
        ownerId: userId,
      },
    });
    return list !== null;
  }

  /**
   * Count collaborators on a list
   */
  async countCollaborators(listId: string): Promise<number> {
    return (this.db as PrismaClient).listCollaborator.count({
      where: { listId },
    });
  }

  /**
   * Get item count for a list
   */
  async getItemCount(listId: string): Promise<number> {
    return (this.db as PrismaClient).listItem.count({
      where: { listId },
    });
  }

  /**
   * Get checked item count for a list
   */
  async getCheckedItemCount(listId: string): Promise<number> {
    return (this.db as PrismaClient).listItem.count({
      where: { listId, isChecked: true },
    });
  }

  /**
   * Get estimated total for a list
   */
  async getEstimatedTotal(listId: string): Promise<number> {
    const result = await (this.db as PrismaClient).listItem.aggregate({
      where: { listId },
      _sum: { estimatedPrice: true },
    });
    return Number(result._sum.estimatedPrice) || 0;
  }

  /**
   * Find accessible lists with filter, pagination, and sorting
   */
  async findAccessible(
    where: Prisma.ShoppingListWhereInput,
    options: { skip: number; take: number; orderBy?: Record<string, string> }
  ): Promise<{ lists: ShoppingList[]; total: number }> {
    const [lists, total] = await Promise.all([
      (this.db as PrismaClient).shoppingList.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy || { createdAt: 'desc' },
      }),
      (this.db as PrismaClient).shoppingList.count({ where }),
    ]);

    return { lists, total };
  }

  /**
   * Find template lists owned by a user
   */
  async findTemplates(ownerId: string): Promise<ShoppingList[]> {
    return (this.db as PrismaClient).shoppingList.findMany({
      where: {
        ownerId,
        isTemplate: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a template list by ID
   */
  async findTemplate(id: string): Promise<ShoppingList | null> {
    return (this.db as PrismaClient).shoppingList.findUnique({
      where: { id, isTemplate: true },
    });
  }

  /**
   * Find a list with owner info
   */
  async findByIdWithOwner(
    id: string
  ): Promise<(ShoppingList & { owner: { id: string; name: string } }) | null> {
    return (this.db as PrismaClient).shoppingList.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
