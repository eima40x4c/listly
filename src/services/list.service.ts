/**
 * List Service Implementation
 *
 * Business logic for shopping list management.
 * Handles list CRUD, budget tracking, templates, and access control.
 *
 * @module services/list.service
 */

import type { Prisma, ShoppingList } from '@prisma/client';

import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';
import {
  CollaborationRepository,
  ItemRepository,
  ListRepository,
  withTransaction,
} from '@/repositories';

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

  // Repository instances
  private listRepo: ListRepository;
  private itemRepo: ItemRepository;
  private collaborationRepo: CollaborationRepository;

  constructor() {
    this.listRepo = new ListRepository();
    this.itemRepo = new ItemRepository();
    this.collaborationRepo = new CollaborationRepository();
  }

  /**
   * Create a new shopping list
   */
  async create(userId: string, input: ICreateListInput): Promise<ShoppingList> {
    // Business rule: Enforce list limit
    const existingCount = await this.listRepo.countByOwner(userId);

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
    return this.listRepo.create({
      name: input.name,
      description: input.description,
      budget: input.budget,
      color: input.color,
      icon: input.icon,
      owner: { connect: { id: userId } },
      store: input.storeId ? { connect: { id: input.storeId } } : undefined,
      isTemplate: input.isTemplate || false,
      status: 'ACTIVE',
    });
  }

  /**
   * Get list by ID
   */
  async getById(id: string, userId: string): Promise<ShoppingList | null> {
    const list = await this.listRepo.findById(id);

    if (!list) {
      return null;
    }

    // Business rule: User must have access
    const hasAccess = await this.listRepo.hasAccess(id, userId);
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

    // Get aggregated metrics using repositories
    const [itemCount, checkedCount, estimatedTotal, collaboratorCount] =
      await Promise.all([
        this.itemRepo.countByList(id),
        this.itemRepo.countCheckedByList(id),
        this.itemRepo.getEstimatedTotalByList(id),
        this.collaborationRepo.countByList(id),
      ]);

    return {
      ...list,
      itemCount,
      checkedCount,
      estimatedTotal,
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

    // Get lists and total count via repository
    const orderBy = filters?.sort
      ? { [filters.sort]: filters.order || 'desc' }
      : { createdAt: 'desc' };

    const { lists, total } = await this.listRepo.findAccessible(where, {
      skip,
      take: limit,
      orderBy,
    });

    // Enrich with metadata using repositories
    const enrichedLists = await Promise.all(
      lists.map(async (list) => {
        const [itemCount, checkedCount, estimatedTotal, collaboratorCount] =
          await Promise.all([
            this.itemRepo.countByList(list.id),
            this.itemRepo.countCheckedByList(list.id),
            this.itemRepo.getEstimatedTotalByList(list.id),
            this.collaborationRepo.countByList(list.id),
          ]);

        return {
          ...list,
          itemCount,
          checkedCount,
          estimatedTotal,
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
      const isOwner = await this.listRepo.isOwner(id, userId);
      if (!isOwner) {
        throw new ForbiddenError('Only the list owner can update these fields');
      }
    }

    return this.listRepo.update(id, data);
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
    const isOwner = await this.listRepo.isOwner(id, userId);
    if (!isOwner) {
      throw new ForbiddenError('Only the list owner can delete this list');
    }

    await this.listRepo.delete(id);
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

    return this.listRepo.update(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
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

    // Get all items from original list via repository
    const items = await this.itemRepo.findByList(id);

    // Create new list with items using transaction
    return withTransaction(async ({ listRepo, itemRepo }) => {
      const newList = await listRepo.create({
        name: newName,
        description: originalList.description,
        budget: originalList.budget,
        color: originalList.color,
        icon: originalList.icon,
        owner: { connect: { id: userId } },
        store: originalList.storeId
          ? { connect: { id: originalList.storeId } }
          : undefined,
        status: 'ACTIVE',
      });

      // Copy items
      for (const item of items) {
        await itemRepo.create({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          priority: item.priority,
          estimatedPrice: item.estimatedPrice,
          sortOrder: item.sortOrder,
          isChecked: false,
          list: { connect: { id: newList.id } },
          addedBy: { connect: { id: userId } },
          category: item.categoryId
            ? { connect: { id: item.categoryId } }
            : undefined,
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
    const template = await this.listRepo.findTemplate(templateId);

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
    return this.listRepo.findTemplates(userId);
  }

  /**
   * Check if user has access to list
   */
  async hasAccess(listId: string, userId: string): Promise<boolean> {
    return this.listRepo.hasAccess(listId, userId);
  }

  /**
   * Get list ownership info
   */
  async getOwner(
    listId: string
  ): Promise<{ ownerId: string; ownerName: string }> {
    const list = await this.listRepo.findByIdWithOwner(listId);

    if (!list) {
      throw new NotFoundError('List not found');
    }

    return {
      ownerId: list.owner.id,
      ownerName: list.owner.name,
    };
  }
}
