/**
 * Item Repository Interface
 *
 * Data access contract for list item operations.
 *
 * @module repositories/interfaces/item-repository.interface
 */

import type { ListItem, Prisma } from '@prisma/client';

import type {
  IBaseRepository,
  QueryOptions,
} from './base-repository.interface';

/**
 * List item with related data
 */
export type ItemWithDetails = ListItem & {
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  addedBy: {
    id: string;
    name: string;
    email: string;
  };
  list: {
    id: string;
    name: string;
  };
};

/**
 * Item Repository Interface
 */
export interface IItemRepository extends IBaseRepository<ListItem> {
  /**
   * Create a new list item
   */
  create(data: Prisma.ListItemCreateInput): Promise<ListItem>;

  /**
   * Find an item by ID
   */
  findById(id: string): Promise<ListItem | null>;

  /**
   * Find an item by ID with related data
   */
  findByIdWithDetails(id: string): Promise<ItemWithDetails | null>;

  /**
   * Update a list item
   */
  update(id: string, data: Prisma.ListItemUpdateInput): Promise<ListItem>;

  /**
   * Delete a list item
   */
  delete(id: string): Promise<void>;

  /**
   * Find items in a list
   */
  findByList(listId: string, options?: QueryOptions): Promise<ListItem[]>;

  /**
   * Find items in a list with details
   */
  findByListWithDetails(listId: string): Promise<ItemWithDetails[]>;

  /**
   * Find items by category
   */
  findByCategory(categoryId: string): Promise<ListItem[]>;

  /**
   * Count items in a list
   */
  countByList(listId: string): Promise<number>;

  /**
   * Count checked items in a list
   */
  countCheckedByList(listId: string): Promise<number>;

  /**
   * Get estimated total for a list
   */
  getEstimatedTotalByList(listId: string): Promise<number>;

  /**
   * Toggle item checked status
   */
  toggleChecked(id: string): Promise<ListItem>;

  /**
   * Bulk update items
   */
  bulkUpdate(ids: string[], data: Prisma.ListItemUpdateInput): Promise<number>;

  /**
   * Bulk delete items
   */
  bulkDelete(ids: string[]): Promise<number>;

  /**
   * Update item positions
   */
  updatePositions(
    updates: Array<{ id: string; sortOrder: number }>
  ): Promise<void>;

  /**
   * Get max sort order for items in a list
   */
  getMaxSortOrder(listId: string): Promise<number>;
}
