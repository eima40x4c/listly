/**
 * Pantry Repository Implementation
 *
 * Data access layer for pantry inventory operations.
 * Encapsulates all Prisma queries for pantry items.
 *
 * @module repositories/pantry.repository
 */

import type { PantryItem, Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  IPantryRepository,
  PantryItemWithDetails,
  PantryQueryOptions,
} from './interfaces/pantry-repository.interface';

export class PantryRepository
  extends BaseRepository<PantryItem>
  implements IPantryRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new pantry item
   */
  async create(data: Prisma.PantryItemCreateInput): Promise<PantryItem> {
    return (this.db as PrismaClient).pantryItem.create({ data });
  }

  /**
   * Find a pantry item by ID
   */
  async findById(id: string): Promise<PantryItem | null> {
    return (this.db as PrismaClient).pantryItem.findUnique({
      where: { id },
    });
  }

  /**
   * Find a pantry item by ID with details
   */
  async findByIdWithDetails(id: string): Promise<PantryItemWithDetails | null> {
    return (this.db as PrismaClient).pantryItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  /**
   * Update a pantry item
   */
  async update(
    id: string,
    data: Prisma.PantryItemUpdateInput
  ): Promise<PantryItem> {
    return (this.db as PrismaClient).pantryItem.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a pantry item
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).pantryItem.delete({
      where: { id },
    });
  }

  /**
   * Find pantry items for a user with filters
   */
  async findByUser(
    userId: string,
    options: PantryQueryOptions = {}
  ): Promise<PantryItemWithDetails[]> {
    const {
      skip = 0,
      take = 50,
      orderBy = 'expirationDate',
      order = 'asc',
      categoryId,
      location,
      isConsumed,
      expiringBefore,
      barcode,
      search,
    } = options;

    const where: Prisma.PantryItemWhereInput = {
      userId,
    };

    if (categoryId) where.categoryId = categoryId;
    if (location) where.location = location;
    if (isConsumed !== undefined) where.isConsumed = isConsumed;
    if (expiringBefore) {
      where.expirationDate = {
        lt: expiringBefore,
      };
    }
    if (barcode) where.barcode = barcode;
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return (this.db as PrismaClient).pantryItem.findMany({
      where,
      skip,
      take,
      orderBy: { [orderBy]: order },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  /**
   * Count pantry items for a user with filters
   */
  async countByUser(
    userId: string,
    options: PantryQueryOptions = {}
  ): Promise<number> {
    const {
      categoryId,
      location,
      isConsumed,
      expiringBefore,
      barcode,
      search,
    } = options;

    const where: Prisma.PantryItemWhereInput = {
      userId,
    };

    if (categoryId) where.categoryId = categoryId;
    if (location) where.location = location;
    if (isConsumed !== undefined) where.isConsumed = isConsumed;
    if (expiringBefore) {
      where.expirationDate = {
        lt: expiringBefore,
      };
    }
    if (barcode) where.barcode = barcode;
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return (this.db as PrismaClient).pantryItem.count({ where });
  }

  /**
   * Find items expiring soon
   */
  async findExpiringSoon(
    userId: string,
    daysThreshold: number
  ): Promise<PantryItemWithDetails[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return (this.db as PrismaClient).pantryItem.findMany({
      where: {
        userId,
        isConsumed: false,
        expirationDate: {
          lte: thresholdDate,
          // gte: today, // Optional: if we only want future expiring, but usually "expired" is also "expiring soon/already"
        },
      },
      orderBy: { expirationDate: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  /**
   * Check if user is the owner of an item
   */
  async isOwner(itemId: string, userId: string): Promise<boolean> {
    const item = await (this.db as PrismaClient).pantryItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });
    return item !== null;
  }
}
