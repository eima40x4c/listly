/**
 * Item Repository Implementation
 *
 * Data access layer for list item operations.
 * Encapsulates all Prisma queries for list items.
 *
 * @module repositories/item.repository
 */

import type { ListItem, Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  IItemRepository,
  ItemWithDetails,
  QueryOptions,
} from './interfaces';

export class ItemRepository
  extends BaseRepository<ListItem>
  implements IItemRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new list item
   */
  async create(data: Prisma.ListItemCreateInput): Promise<ListItem> {
    return (this.db as PrismaClient).listItem.create({ data });
  }

  /**
   * Find an item by ID
   */
  async findById(id: string): Promise<ListItem | null> {
    return (this.db as PrismaClient).listItem.findUnique({
      where: { id },
    });
  }

  /**
   * Find an item by ID with related data
   */
  async findByIdWithDetails(id: string): Promise<ItemWithDetails | null> {
    return (this.db as PrismaClient).listItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        addedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update a list item
   */
  async update(
    id: string,
    data: Prisma.ListItemUpdateInput
  ): Promise<ListItem> {
    return (this.db as PrismaClient).listItem.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a list item
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).listItem.delete({
      where: { id },
    });
  }

  /**
   * Find items in a list
   */
  async findByList(
    listId: string,
    options: QueryOptions = {}
  ): Promise<ListItem[]> {
    const {
      skip = 0,
      take = 500,
      orderBy = 'sortOrder',
      order = 'asc',
    } = options;

    return (this.db as PrismaClient).listItem.findMany({
      where: { listId },
      skip,
      take,
      orderBy: { [orderBy]: order },
    });
  }

  /**
   * Find items in a list with details
   */
  async findByListWithDetails(listId: string): Promise<ItemWithDetails[]> {
    return (this.db as PrismaClient).listItem.findMany({
      where: { listId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        addedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Find items by category
   */
  async findByCategory(categoryId: string): Promise<ListItem[]> {
    return (this.db as PrismaClient).listItem.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count items in a list
   */
  async countByList(listId: string): Promise<number> {
    return (this.db as PrismaClient).listItem.count({
      where: { listId },
    });
  }

  /**
   * Count checked items in a list
   */
  async countCheckedByList(listId: string): Promise<number> {
    return (this.db as PrismaClient).listItem.count({
      where: { listId, isChecked: true },
    });
  }

  /**
   * Get estimated total for a list
   */
  async getEstimatedTotalByList(listId: string): Promise<number> {
    const result = await (this.db as PrismaClient).listItem.aggregate({
      where: { listId },
      _sum: { estimatedPrice: true },
    });
    return Number(result._sum.estimatedPrice) || 0;
  }

  /**
   * Toggle item checked status
   */
  async toggleChecked(id: string): Promise<ListItem> {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    return this.update(id, {
      isChecked: !item.isChecked,
      checkedAt: !item.isChecked ? new Date() : null,
    });
  }

  /**
   * Bulk update items
   */
  async bulkUpdate(
    ids: string[],
    data: Prisma.ListItemUpdateInput
  ): Promise<number> {
    const result = await (this.db as PrismaClient).listItem.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return result.count;
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(ids: string[]): Promise<number> {
    const result = await (this.db as PrismaClient).listItem.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  /**
   * Update item positions
   */
  async updatePositions(
    updates: Array<{ id: string; sortOrder: number }>
  ): Promise<void> {
    await Promise.all(
      updates.map((update) =>
        this.update(update.id, { sortOrder: update.sortOrder })
      )
    );
  }

  /**
   * Get max sort order for items in a list
   */
  async getMaxSortOrder(listId: string): Promise<number> {
    const result = await (this.db as PrismaClient).listItem.aggregate({
      where: { listId },
      _max: { sortOrder: true },
    });
    return result._max.sortOrder || 0;
  }
}
