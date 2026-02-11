/**
 * List Service Implementation
 *
 * Business logic for shopping list management.
 * Handles list CRUD, budget tracking, templates, and access control.
 *
 * @module services/list.service
 */

import type { Prisma, ShoppingList } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';

import type {
  ICreateListInput,
  IListFilters,
  IListService,
  IListWithMeta,
  IPaginatedResponse,
  IUpdateListInput,
} from './interfaces';

// Business rules
const MAX_LISTS_PER_USER = 100;
const MAX_LIST_NAME_LENGTH = 100;

export class ListService implements IListService {
  readonly serviceName = 'ListService';

  /**
   * Create a new shopping list
   */
  async create(userId: string, input: ICreateListInput): Promise<ShoppingList> {
    // Business rule: Enforce list limit
    const existingCount = await prisma.shoppingList.count({
      where: { ownerId: userId },
    });

    if (existingCount >= MAX_LISTS_PER_USER) {
      throw new ValidationError(
        `Maximum limit reached (${MAX_LISTS_PER_USER} lists)`
      );
    }

    // Business rule: Validate name length
    if (input.name.length > MAX_LIST_NAME_LENGTH) {
      throw new ValidationError(
        `List name must be ${MAX_LIST_NAME_LENGTH} characters or less`
      );
    }

    // Create list with default values
    return prisma.shoppingList.create({
      data: {
        name: input.name,
        description: input.description,
        budget: input.budget,
        color: input.color,
        icon: input.icon,
        ownerId: userId,
        storeId: input.storeId,
        isTemplate: input.isTemplate || false,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Get list by ID
   */
  async getById(id: string, userId: string): Promise<ShoppingList | null> {
    const list = await prisma.shoppingList.findUnique({
      where: { id },
    });

    if (!list) {
      return null;
    }

    // Business rule: User must have access
    const hasAccess = await this.hasAccess(id, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    return list;
  }

  /**
   * Get list by ID with full details
   */
  async getByIdWithDetails(
    id: string,
    userId: string
  ): Promise<IListWithMeta | null> {
    const list = await this.getById(id, userId);
    if (!list) {
      return null;
    }

    // Get aggregated metrics
    const [itemStats, collaboratorCount] = await Promise.all([
      prisma.listItem.aggregate({
        where: { listId: id },
        _count: { id: true },
        _sum: { estimatedPrice: true },
      }),
      prisma.listCollaborator.count({
        where: { listId: id },
      }),
    ]);

    const checkedCount = await prisma.listItem.count({
      where: { listId: id, isChecked: true },
    });

    return {
      ...list,
      itemCount: itemStats._count.id || 0,
      checkedCount,
      estimatedTotal: Number(itemStats._sum.estimatedPrice || 0),
      collaboratorCount,
    };
  }

  /**
   * Get lists for a user with filters
   */
  async getByUser(
    userId: string,
    filters?: IListFilters
  ): Promise<IPaginatedResponse<IListWithMeta>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ShoppingListWhereInput = {
      OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.storeId) {
      where.storeId = filters.storeId;
    }

    if (filters?.isTemplate !== undefined) {
      where.isTemplate = filters.isTemplate;
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    // Get lists and total count
    const [lists, total] = await Promise.all([
      prisma.shoppingList.findMany({
        where,
        skip,
        take: limit,
        orderBy: filters?.sort
          ? { [filters.sort]: filters.order || 'desc' }
          : { createdAt: 'desc' },
      }),
      prisma.shoppingList.count({ where }),
    ]);

    // Enrich with metadata
    const enrichedLists = await Promise.all(
      lists.map(async (list) => {
        const [itemStats, collaboratorCount] = await Promise.all([
          prisma.listItem.aggregate({
            where: { listId: list.id },
            _count: { id: true },
            _sum: { estimatedPrice: true },
          }),
          prisma.listCollaborator.count({
            where: { listId: list.id },
          }),
        ]);

        const checkedCount = await prisma.listItem.count({
          where: { listId: list.id, isChecked: true },
        });

        return {
          ...list,
          itemCount: itemStats._count.id || 0,
          checkedCount,
          estimatedTotal: Number(itemStats._sum.estimatedPrice || 0),
          collaboratorCount,
        };
      })
    );

    return {
      data: enrichedLists,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a list
   */
  async update(
    id: string,
    userId: string,
    data: IUpdateListInput
  ): Promise<ShoppingList> {
    const list = await this.getById(id, userId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Business rule: Only owner can update certain fields
    if (data.name || data.description || data.status) {
      if (list.ownerId !== userId) {
        throw new ForbiddenError('Only the list owner can update these fields');
      }
    }

    return prisma.shoppingList.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a list
   */
  async delete(id: string, userId: string): Promise<void> {
    const list = await this.getById(id, userId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Business rule: Only owner can delete
    if (list.ownerId !== userId) {
      throw new ForbiddenError('Only the list owner can delete this list');
    }

    await prisma.shoppingList.delete({
      where: { id },
    });
  }

  /**
   * Set or update budget
   */
  async setBudget(
    id: string,
    userId: string,
    budget: number
  ): Promise<ShoppingList> {
    if (budget < 0) {
      throw new ValidationError('Budget must be a positive number');
    }

    return this.update(id, userId, { budget });
  }

  /**
   * Mark list as completed
   */
  async complete(id: string, userId: string): Promise<ShoppingList> {
    const list = await this.getById(id, userId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    return prisma.shoppingList.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  /**
   * Archive a list
   */
  async archive(id: string, userId: string): Promise<ShoppingList> {
    return this.update(id, userId, { status: 'ARCHIVED' });
  }

  /**
   * Duplicate a list
   */
  async duplicate(
    id: string,
    userId: string,
    newName: string
  ): Promise<ShoppingList> {
    const originalList = await this.getById(id, userId);
    if (!originalList) {
      throw new NotFoundError('List not found');
    }

    // Get all items from original list
    const items = await prisma.listItem.findMany({
      where: { listId: id },
      select: {
        name: true,
        quantity: true,
        unit: true,
        notes: true,
        priority: true,
        estimatedPrice: true,
        categoryId: true,
        sortOrder: true,
      },
    });

    // Create new list with items in a transaction
    return prisma.$transaction(async (tx) => {
      const newList = await tx.shoppingList.create({
        data: {
          name: newName,
          description: originalList.description,
          budget: originalList.budget,
          color: originalList.color,
          icon: originalList.icon,
          ownerId: userId,
          storeId: originalList.storeId,
          status: 'ACTIVE',
        },
      });

      // Copy items
      if (items.length > 0) {
        await tx.listItem.createMany({
          data: items.map((item) => ({
            ...item,
            listId: newList.id,
            addedById: userId,
            isChecked: false,
          })),
        });
      }

      return newList;
    });
  }

  /**
   * Create list from template
   */
  async createFromTemplate(
    templateId: string,
    userId: string,
    name?: string
  ): Promise<ShoppingList> {
    const template = await prisma.shoppingList.findUnique({
      where: { id: templateId, isTemplate: true },
    });

    if (!template) {
      throw new NotFoundError('Template not found');
    }

    return this.duplicate(
      templateId,
      userId,
      name || `${template.name} (Copy)`
    );
  }

  /**
   * Get user's list templates
   */
  async getTemplates(userId: string): Promise<ShoppingList[]> {
    return prisma.shoppingList.findMany({
      where: {
        ownerId: userId,
        isTemplate: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Check if user has access to list
   */
  async hasAccess(listId: string, userId: string): Promise<boolean> {
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      },
    });

    return !!list;
  }

  /**
   * Get list ownership info
   */
  async getOwner(
    listId: string
  ): Promise<{ ownerId: string; ownerName: string }> {
    const list = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    return {
      ownerId: list.owner.id,
      ownerName: list.owner.name,
    };
  }
}
