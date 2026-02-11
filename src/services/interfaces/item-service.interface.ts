/**
 * Item Service Interface
 *
 * Defines the contract for list item business logic.
 * Handles item CRUD, check-off, auto-categorization, and price tracking.
 *
 * @module services/interfaces/item-service.interface
 */

import type { ListItem } from '@prisma/client';

import type { IBaseService } from './base-service.interface';

/**
 * Input for creating a new list item
 */
export interface ICreateItemInput {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  estimatedPrice?: number;
  priority?: number;
  listId: string;
  addedById: string;
  categoryId?: string; // Optional - will auto-categorize if not provided
}

/**
 * Input for updating a list item
 */
export interface IUpdateItemInput {
  name?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  estimatedPrice?: number;
  priority?: number;
  categoryId?: string;
  sortOrder?: number;
}

/**
 * Input for checking off an item
 */
export interface ICheckItemInput {
  actualPrice?: number; // Optional price paid
}

/**
 * Result of item creation with auto-categorization
 */
export interface IItemCreateResult {
  item: ListItem;
  autoCategorized: boolean;
  suggestedCategory?: string;
}

/**
 * Bulk item creation input
 */
export interface IBulkCreateItemsInput {
  listId: string;
  addedById: string;
  items: Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
}

/**
 * Item with category and contributor info
 */
export interface IItemWithDetails extends ListItem {
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
  addedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

/**
 * List Item Service Interface
 */
export interface IItemService extends IBaseService {
  /**
   * Create a new item with auto-categorization
   */
  create(input: ICreateItemInput): Promise<IItemCreateResult>;

  /**
   * Create multiple items at once (bulk add)
   */
  createMany(input: IBulkCreateItemsInput): Promise<ListItem[]>;

  /**
   * Create item from voice transcription
   */
  createFromTranscription(
    transcription: string,
    listId: string,
    addedById: string
  ): Promise<IItemCreateResult>;

  /**
   * Get item by ID
   */
  getById(id: string, userId: string): Promise<IItemWithDetails | null>;

  /**
   * Get all items for a list
   */
  getByList(
    listId: string,
    userId: string,
    includeChecked?: boolean
  ): Promise<IItemWithDetails[]>;

  /**
   * Update an item
   */
  update(id: string, userId: string, data: IUpdateItemInput): Promise<ListItem>;

  /**
   * Delete an item
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Toggle item checked status
   */
  toggleCheck(
    id: string,
    userId: string,
    input?: ICheckItemInput
  ): Promise<ListItem>;

  /**
   * Mark item as checked
   */
  check(id: string, userId: string, input?: ICheckItemInput): Promise<ListItem>;

  /**
   * Mark item as unchecked
   */
  uncheck(id: string, userId: string): Promise<ListItem>;

  /**
   * Complete shopping (check all items, move to history)
   */
  completeList(listId: string, userId: string): Promise<void>;

  /**
   * Auto-categorize an item based on name
   */
  autoCategorizе(itemName: string): Promise<string | null>;

  /**
   * Reorder items in a list
   */
  reorder(listId: string, userId: string, itemIds: string[]): Promise<void>;

  /**
   * Move item to another list
   */
  moveToList(
    itemId: string,
    targetListId: string,
    userId: string
  ): Promise<ListItem>;

  /**
   * Get unchecked item count for a list
   */
  getUncheckedCount(listId: string): Promise<number>;

  /**
   * Get estimated total price for unchecked items
   */
  getEstimatedTotal(listId: string): Promise<number>;
}
