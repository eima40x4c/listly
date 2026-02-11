/**
 * Item Service Implementation
 *
 * Business logic for list item management.
 * Handles item CRUD, check-off, auto-categorization, and bulk operations.
 *
 * @module services/item.service
 */

import type { ListItem, Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';

import type {
  IBulkCreateItemsInput,
  ICheckItemInput,
  ICreateItemInput,
  IItemCreateResult,
  IItemService,
  IItemWithDetails,
  IUpdateItemInput,
} from './interfaces';

// Business rules
const MAX_ITEMS_PER_LIST = 500;
const MAX_ITEM_NAME_LENGTH = 200;

// Category mapping patterns (simple implementation)
const CATEGORY_PATTERNS: Record<string, string[]> = {
  produce: [
    'apple',
    'banana',
    'orange',
    'lettuce',
    'tomato',
    'carrot',
    'fruit',
    'vegetable',
  ],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'],
  meat: ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'meat'],
  bakery: ['bread', 'bagel', 'croissant', 'roll', 'bun', 'cake'],
  pantry: [
    'pasta',
    'rice',
    'flour',
    'sugar',
    'salt',
    'pepper',
    'oil',
    'cereal',
  ],
  beverages: ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
  frozen: ['ice cream', 'frozen', 'popsicle'],
  snacks: ['chips', 'crackers', 'cookies', 'candy', 'nuts'],
  household: ['paper towel', 'toilet paper', 'soap', 'detergent', 'cleaner'],
};

export class ItemService implements IItemService {
  readonly serviceName = 'ItemService';

  /**
   * Create a new item with auto-categorization
   */
  async create(input: ICreateItemInput): Promise<IItemCreateResult> {
    // Business rule: Enforce item limit per list
    const existingCount = await prisma.listItem.count({
      where: { listId: input.listId },
    });

    if (existingCount >= MAX_ITEMS_PER_LIST) {
      throw new ValidationError(
        `Maximum limit reached (${MAX_ITEMS_PER_LIST} items per list)`
      );
    }

    // Validate name length
    if (input.name.length > MAX_ITEM_NAME_LENGTH) {
      throw new ValidationError(
        `Item name must be ${MAX_ITEM_NAME_LENGTH} characters or less`
      );
    }

    // Verify user has access to the list
    const hasAccess = await this.checkListAccess(input.listId, input.addedById);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    // Auto-categorize if category not provided
    let categoryId = input.categoryId;
    let autoCategorized = false;
    let suggestedCategory: string | undefined;

    if (!categoryId) {
      const categorySlug = await this.autoCategorizе(input.name);
      if (categorySlug) {
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });
        if (category) {
          categoryId = category.id;
          autoCategorized = true;
          suggestedCategory = category.name;
        }
      }
    }

    // Get next sort order
    const maxOrder = await prisma.listItem.aggregate({
      where: { listId: input.listId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder || 0) + 1;

    const item = await prisma.listItem.create({
      data: {
        name: input.name,
        quantity: input.quantity || 1,
        unit: input.unit,
        notes: input.notes,
        estimatedPrice: input.estimatedPrice,
        priority: input.priority || 0,
        listId: input.listId,
        addedById: input.addedById,
        categoryId,
        sortOrder,
      },
    });

    return {
      item,
      autoCategorized,
      suggestedCategory,
    };
  }

  /**
   * Create multiple items at once
   */
  async createMany(input: IBulkCreateItemsInput): Promise<ListItem[]> {
    const results: ListItem[] = [];

    for (const itemData of input.items) {
      const result = await this.create({
        ...itemData,
        listId: input.listId,
        addedById: input.addedById,
      });
      results.push(result.item);
    }

    return results;
  }

  /**
   * Create item from voice transcription
   */
  async createFromTranscription(
    transcription: string,
    listId: string,
    addedById: string
  ): Promise<IItemCreateResult> {
    // Simple parsing: extract quantity and item name
    // Format examples: "2 apples", "milk", "1 dozen eggs"
    const match = transcription.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);

    let quantity = 1;
    let name = transcription.trim();
    let unit: string | undefined;

    if (match) {
      quantity = parseFloat(match[1]);
      name = match[2].trim();

      // Extract common units
      const unitMatch = name.match(/^(dozen|lb|lbs|kg|g|oz|ml|l)\s+(.+)$/i);
      if (unitMatch) {
        unit = unitMatch[1].toLowerCase();
        name = unitMatch[2].trim();
      }
    }

    return this.create({
      name,
      quantity,
      unit,
      listId,
      addedById,
    });
  }

  /**
   * Get item by ID
   */
  async getById(id: string, userId: string): Promise<IItemWithDetails | null> {
    const item = await prisma.listItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
        addedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    // Verify access
    const hasAccess = await this.checkListAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    return {
      ...item,
      category: item.category
        ? {
            ...item.category,
            icon: item.category.icon ?? undefined,
            color: item.category.color ?? undefined,
          }
        : undefined,
      addedBy: {
        ...item.addedBy,
        avatarUrl: item.addedBy.avatarUrl ?? undefined,
      },
    };
  }

  /**
   * Get all items for a list
   */
  async getByList(
    listId: string,
    userId: string,
    includeChecked = true
  ): Promise<IItemWithDetails[]> {
    // Verify access
    const hasAccess = await this.checkListAccess(listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    const items = await prisma.listItem.findMany({
      where: {
        listId,
        ...(includeChecked ? {} : { isChecked: false }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
        addedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ isChecked: 'asc' }, { sortOrder: 'asc' }],
    });

    // Map to proper types (convert null to undefined)
    return items.map((item) => ({
      ...item,
      category: item.category
        ? {
            ...item.category,
            icon: item.category.icon ?? undefined,
            color: item.category.color ?? undefined,
          }
        : undefined,
      addedBy: {
        ...item.addedBy,
        avatarUrl: item.addedBy.avatarUrl ?? undefined,
      },
    }));
  }

  /**
   * Update an item
   */
  async update(
    id: string,
    userId: string,
    data: IUpdateItemInput
  ): Promise<ListItem> {
    const item = await prisma.listItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Verify access
    const hasAccess = await this.checkListAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    return prisma.listItem.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an item
   */
  async delete(id: string, userId: string): Promise<void> {
    const item = await prisma.listItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    const hasAccess = await this.checkListAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    await prisma.listItem.delete({
      where: { id },
    });
  }

  /**
   * Toggle item checked status
   */
  async toggleCheck(
    id: string,
    userId: string,
    input?: ICheckItemInput
  ): Promise<ListItem> {
    const item = await prisma.listItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    const hasAccess = await this.checkListAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    const newCheckedState = !item.isChecked;

    // If checking and price provided, record to history
    const updateData: Prisma.ListItemUpdateInput = {
      isChecked: newCheckedState,
      checkedAt: newCheckedState ? new Date() : null,
    };

    if (newCheckedState && input?.actualPrice) {
      updateData.estimatedPrice = input.actualPrice;
    }

    return prisma.listItem.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Mark item as checked
   */
  async check(
    id: string,
    userId: string,
    input?: ICheckItemInput
  ): Promise<ListItem> {
    const item = await prisma.listItem.findUnique({
      where: { id },
    });

    if (!item || item.isChecked) {
      if (!item) {
        throw new NotFoundError('Item not found');
      }
      return item;
    }

    return this.toggleCheck(id, userId, input);
  }

  /**
   * Mark item as unchecked
   */
  async uncheck(id: string, userId: string): Promise<ListItem> {
    const item = await prisma.listItem.findUnique({
      where: { id },
    });

    if (!item || !item.isChecked) {
      if (!item) {
        throw new NotFoundError('Item not found');
      }
      return item;
    }

    return this.toggleCheck(id, userId);
  }

  /**
   * Complete shopping (check all items)
   */
  async completeList(listId: string, userId: string): Promise<void> {
    const hasAccess = await this.checkListAccess(listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    await prisma.listItem.updateMany({
      where: { listId, isChecked: false },
      data: {
        isChecked: true,
        checkedAt: new Date(),
      },
    });
  }

  /**
   * Auto-categorize item based on name
   */
  async autoCategorizе(itemName: string): Promise<string | null> {
    const lowerName = itemName.toLowerCase();

    for (const [categorySlug, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerName.includes(pattern)) {
          return categorySlug;
        }
      }
    }

    return null;
  }

  /**
   * Reorder items in a list
   */
  async reorder(
    listId: string,
    userId: string,
    itemIds: string[]
  ): Promise<void> {
    const hasAccess = await this.checkListAccess(listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    // Update sort order in transaction
    await prisma.$transaction(
      itemIds.map((itemId, index) =>
        prisma.listItem.update({
          where: { id: itemId },
          data: { sortOrder: index },
        })
      )
    );
  }

  /**
   * Move item to another list
   */
  async moveToList(
    itemId: string,
    targetListId: string,
    userId: string
  ): Promise<ListItem> {
    const item = await prisma.listItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Verify access to both lists
    const [hasSourceAccess, hasTargetAccess] = await Promise.all([
      this.checkListAccess(item.listId, userId),
      this.checkListAccess(targetListId, userId),
    ]);

    if (!hasSourceAccess || !hasTargetAccess) {
      throw new ForbiddenError('You do not have access to one or both lists');
    }

    return prisma.listItem.update({
      where: { id: itemId },
      data: {
        listId: targetListId,
        isChecked: false,
        checkedAt: null,
      },
    });
  }

  /**
   * Get unchecked item count
   */
  async getUncheckedCount(listId: string): Promise<number> {
    return prisma.listItem.count({
      where: { listId, isChecked: false },
    });
  }

  /**
   * Get estimated total price
   */
  async getEstimatedTotal(listId: string): Promise<number> {
    const result = await prisma.listItem.aggregate({
      where: { listId, isChecked: false },
      _sum: { estimatedPrice: true },
    });

    return Number(result._sum.estimatedPrice || 0);
  }

  /**
   * Check if user has access to list
   */
  private async checkListAccess(
    listId: string,
    userId: string
  ): Promise<boolean> {
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      },
    });

    return !!list;
  }
}
