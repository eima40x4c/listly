/**
 * Category Service Implementation
 *
 * Business logic for category management.
 * Handles category CRUD, store customization, and item categorization.
 *
 * @module services/category.service
 */

import type { Category, StoreCategory } from '@prisma/client';

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';
import { CategoryRepository } from '@/repositories';
import type { CategoryWithStore } from '@/repositories/interfaces/category-repository.interface';

import type {
  ICategoryService,
  ICategoryWithCount,
  ICreateCategoryInput,
  IStoreCategoryInput,
  IUpdateCategoryInput,
} from './interfaces';

export class CategoryService implements ICategoryService {
  readonly serviceName = 'CategoryService';

  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Get all default categories
   */
  async getDefaults(): Promise<Category[]> {
    return this.categoryRepo.findDefaults();
  }

  /**
   * Get categories for a specific store
   */
  async getByStore(storeId: string): Promise<CategoryWithStore[]> {
    return this.categoryRepo.findByStore(storeId);
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepo.findBySlug(slug);
  }

  /**
   * Create a custom category
   */
  async create(input: ICreateCategoryInput): Promise<Category> {
    // Check for slug uniqueness
    const existing = await this.getBySlug(input.slug);
    if (existing) {
      throw new ConflictError('Category with this slug already exists');
    }

    return this.categoryRepo.create({
      ...input,
      isDefault: false,
    });
  }

  /**
   * Update a category
   */
  async update(id: string, data: IUpdateCategoryInput): Promise<Category> {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Prevent updating default categories
    if (category.isDefault) {
      throw new ValidationError('Cannot update default categories');
    }

    return this.categoryRepo.update(id, data);
  }

  /**
   * Delete a custom category
   */
  async delete(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.isDefault) {
      throw new ValidationError('Cannot delete default categories');
    }

    await this.categoryRepo.delete(id);
  }

  /**
   * Customize categories for a specific store
   */
  async customizeForStore(
    storeId: string,
    customizations: IStoreCategoryInput[]
  ): Promise<StoreCategory[]> {
    return this.categoryRepo.customizeForStore(storeId, customizations);
  }

  /**
   * Update store category order
   */
  async updateStoreOrder(
    storeId: string,
    categoryIds: string[]
  ): Promise<void> {
    await this.categoryRepo.updateStoreOrder(storeId, categoryIds);
  }

  /**
   * Search categories by name
   */
  async search(query: string): Promise<Category[]> {
    return this.categoryRepo.search(query, 10);
  }

  /**
   * Get category usage statistics
   */
  async getUsageStats(userId: string): Promise<ICategoryWithCount[]> {
    return this.categoryRepo.getUsageStatsForUser(userId);
  }

  /**
   * Find best matching category for item name
   */
  async findBestMatch(itemName: string): Promise<Category | null> {
    // Simple keyword matching
    const keywords = itemName.toLowerCase().split(' ');

    const categories = await this.categoryRepo.findDefaults();

    for (const category of categories) {
      const categoryWords = category.name.toLowerCase().split(' ');
      for (const keyword of keywords) {
        for (const word of categoryWords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            return category;
          }
        }
      }
    }

    return null;
  }
}
