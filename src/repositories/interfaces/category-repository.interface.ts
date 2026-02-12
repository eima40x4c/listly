/**
 * Category Repository Interface
 *
 * Data access contract for category operations.
 *
 * @module repositories/interfaces/category-repository.interface
 */

import type { Category, Prisma, StoreCategory } from '@prisma/client';

import type { IBaseRepository } from './base-repository.interface';

/**
 * Category with store-specific customization
 */
export type CategoryWithStore = Category & {
  storeCategory?: {
    id: string;
    aisleNumber: string | null;
    customName: string | null;
    sortOrder: number;
  } | null;
};

/**
 * Category with usage count
 */
export type CategoryWithCount = Category & {
  itemCount: number;
};

/**
 * Category Repository Interface
 */
export interface ICategoryRepository extends IBaseRepository<Category> {
  /**
   * Create a new category
   */
  create(data: Prisma.CategoryCreateInput): Promise<Category>;

  /**
   * Find a category by ID
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find a category by slug
   */
  findBySlug(slug: string): Promise<Category | null>;

  /**
   * Update a category
   */
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;

  /**
   * Delete a category
   */
  delete(id: string): Promise<void>;

  /**
   * Find all default categories
   */
  findDefaults(): Promise<Category[]>;

  /**
   * Find categories for a store with customization
   */
  findByStore(storeId: string): Promise<CategoryWithStore[]>;

  /**
   * Find categories with usage count
   */
  findWithUsageCount(): Promise<CategoryWithCount[]>;

  /**
   * Search categories by name
   */
  search(query: string, limit?: number): Promise<Category[]>;

  /**
   * Create or update store category customization
   */
  upsertStoreCategory(
    storeId: string,
    categoryId: string,
    data: Prisma.StoreCategoryCreateInput
  ): Promise<StoreCategory>;

  /**
   * Delete store category customization
   */
  deleteStoreCategory(storeId: string, categoryId: string): Promise<void>;

  /**
   * Get category usage stats for a specific user
   */
  getUsageStatsForUser(
    userId: string
  ): Promise<Array<Category & { itemCount: number }>>;

  /**
   * Replace store category customizations
   */
  customizeForStore(
    storeId: string,
    customizations: Array<{
      categoryId: string;
      aisleNumber?: string;
      customName?: string;
      sortOrder: number;
    }>
  ): Promise<StoreCategory[]>;

  /**
   * Update store category sort order
   */
  updateStoreOrder(storeId: string, categoryIds: string[]): Promise<void>;
}
