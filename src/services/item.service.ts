/**
 * Item Service Implementation
 *
 * Business logic for list item management.
 * Handles item CRUD, check-off, auto-categorization, and bulk operations.
 *
 * @module services/item.service
 */

import type { ListItem, Prisma } from '@prisma/client';

import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';
import {
  CategoryRepository,
  ItemRepository,
  ListRepository,
} from '@/repositories';

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

  // Repository instances
  private itemRepo: ItemRepository;
  private listRepo: ListRepository;
  private categoryRepo: CategoryRepository;

  constructor() {
    this.itemRepo = new ItemRepository();
    this.listRepo = new ListRepository();
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Create a new item with auto-categorization
   */
  async create(input: ICreateItemInput): Promise<IItemCreateResult> {
    // Business rule: Enforce item limit per list
    const existingCount = await this.itemRepo.countByList(input.listId);

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
    const hasAccess = await this.listRepo.hasAccess(
      input.listId,
      input.addedById
    );
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
        const category = await this.categoryRepo.findBySlug(categorySlug);
        if (category) {
          categoryId = category.id;
          autoCategorized = true;
          suggestedCategory = category.name;
        }
      }
    }

    // Get next sort order via repository
    const maxSortOrder = await this.itemRepo.getMaxSortOrder(input.listId);
    const sortOrder = maxSortOrder + 1;

    const item = await this.itemRepo.create({
      name: input.name,
      quantity: input.quantity || 1,
      unit: input.unit,
      notes: input.notes,
      estimatedPrice: input.estimatedPrice,
      priority: input.priority || 0,
      sortOrder,
      list: { connect: { id: input.listId } },
      addedBy: { connect: { id: input.addedById } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
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
    const item = await this.itemRepo.findByIdWithDetails(id);

    if (!item) {
      return null;
    }

    // Verify access
    const hasAccess = await this.listRepo.hasAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    return item as IItemWithDetails;
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
    const hasAccess = await this.listRepo.hasAccess(listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    const items = await this.itemRepo.findByListWithDetails(listId);

    // Filter checked items if needed
    if (!includeChecked) {
      return items.filter((item) => !item.isChecked) as IItemWithDetails[];
    }

    return items as IItemWithDetails[];
  }

  /**
   * Update an item
   */
  async update(
    id: string,
    userId: string,
    data: IUpdateItemInput
  ): Promise<ListItem> {
    const item = await this.itemRepo.findById(id);

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Verify access
    const hasAccess = await this.listRepo.hasAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    return this.itemRepo.update(id, data);
  }

  /**
   * Delete an item
   */
  async delete(id: string, userId: string): Promise<void> {
    const item = await this.itemRepo.findById(id);

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    const hasAccess = await this.listRepo.hasAccess(item.listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this item');
    }

    await this.itemRepo.delete(id);
  }

  /**
   * Toggle item checked status
   */
  async toggleCheck(
    id: string,
    userId: string,
    input?: ICheckItemInput
  ): Promise<ListItem> {
    const item = await this.itemRepo.findById(id);

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    const hasAccess = await this.listRepo.hasAccess(item.listId, userId);
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

    return this.itemRepo.update(id, updateData);
  }

  /**
   * Mark item as checked
   */
  async check(
    id: string,
    userId: string,
    input?: ICheckItemInput
  ): Promise<ListItem> {
    const item = await this.itemRepo.findById(id);

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
    const item = await this.itemRepo.findById(id);

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
    const hasAccess = await this.listRepo.hasAccess(listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    // Get all unchecked items
    const items = await this.itemRepo.findByList(listId);
    const uncheckedIds = items.filter((i) => !i.isChecked).map((i) => i.id);

    if (uncheckedIds.length > 0) {
      await this.itemRepo.bulkUpdate(uncheckedIds, {
        isChecked: true,
        checkedAt: new Date(),
      });
    }
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
    const hasAccess = await this.listRepo.hasAccess(listId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this list');
    }

    // Convert to position updates
    const updates = itemIds.map((id, index) => ({ id, sortOrder: index }));
    await this.itemRepo.updatePositions(updates);
  }

  /**
   * Move item to another list
   */
  async moveToList(
    itemId: string,
    targetListId: string,
    userId: string
  ): Promise<ListItem> {
    const item = await this.itemRepo.findById(itemId);

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Verify access to both lists
    const [hasSourceAccess, hasTargetAccess] = await Promise.all([
      this.listRepo.hasAccess(item.listId, userId),
      this.listRepo.hasAccess(targetListId, userId),
    ]);

    if (!hasSourceAccess || !hasTargetAccess) {
      throw new ForbiddenError('You do not have access to one or both lists');
    }

    return this.itemRepo.update(itemId, {
      list: { connect: { id: targetListId } },
      isChecked: false,
      checkedAt: null,
    });
  }

  /**
   * Get unchecked item count
   */
  async getUncheckedCount(listId: string): Promise<number> {
    const total = await this.itemRepo.countByList(listId);
    const checked = await this.itemRepo.countCheckedByList(listId);
    return total - checked;
  }

  /**
   * Get estimated total price
   */
  async getEstimatedTotal(listId: string): Promise<number> {
    return this.itemRepo.getEstimatedTotalByList(listId);
  }
}
