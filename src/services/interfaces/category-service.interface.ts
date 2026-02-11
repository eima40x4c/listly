/**
 * Category Service Interface
 *
 * Defines the contract for category management.
 * Handles category CRUD, store-specific customization, and aisle ordering.
 *
 * @module services/interfaces/category-service.interface
 */

import type { Category, StoreCategory } from '@prisma/client';

import type { IBaseService } from './base-service.interface';

/**
 * Input for creating a custom category
 */
export interface ICreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

/**
 * Input for updating a category
 */
export interface IUpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

/**
 * Store-specific category customization
 */
export interface IStoreCategoryInput {
  categoryId: string;
  aisleNumber?: string;
  customName?: string;
  sortOrder: number;
}

/**
 * Category with item count
 */
export interface ICategoryWithCount extends Category {
  itemCount: number;
}

/**
 * Category Service Interface
 */
export interface ICategoryService extends IBaseService {
  /**
   * Get all default categories
   */
  getDefaults(): Promise<Category[]>;

  /**
   * Get categories for a specific store
   */
  getByStore(
    storeId: string
  ): Promise<(Category & { storeCategory?: StoreCategory })[]>;

  /**
   * Get category by slug
   */
  getBySlug(slug: string): Promise<Category | null>;

  /**
   * Create a custom category
   */
  create(input: ICreateCategoryInput): Promise<Category>;

  /**
   * Update a category
   */
  update(id: string, data: IUpdateCategoryInput): Promise<Category>;

  /**
   * Delete a custom category
   */
  delete(id: string): Promise<void>;

  /**
   * Customize category for a specific store
   */
  customizeForStore(
    storeId: string,
    categoryCustomizations: IStoreCategoryInput[]
  ): Promise<StoreCategory[]>;

  /**
   * Update store category aisle order
   */
  updateStoreOrder(storeId: string, categoryIds: string[]): Promise<void>;

  /**
   * Search categories by name
   */
  search(query: string): Promise<Category[]>;

  /**
   * Get category usage statistics
   */
  getUsageStats(userId: string): Promise<ICategoryWithCount[]>;

  /**
   * Find best matching category for item name
   */
  findBestMatch(itemName: string): Promise<Category | null>;
}
