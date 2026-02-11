/**
 * Category Service Implementation
 *
 * Business logic for category management.
 * Handles category CRUD, store customization, and item categorization.
 *
 * @module services/category.service
 */

import type { Category, StoreCategory } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/AppError';

import type {
  ICategoryService,
  ICategoryWithCount,
  ICreateCategoryInput,
  IStoreCategoryInput,
  IUpdateCategoryInput,
} from './interfaces';

export class CategoryService implements ICategoryService {
  readonly serviceName = 'CategoryService';

  /**
   * Get all default categories
   */
  async getDefaults(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isDefault: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Get categories for a specific store
   */
  async getByStore(
    storeId: string
  ): Promise<(Category & { storeCategory?: StoreCategory })[]> {
    const categories = await prisma.category.findMany({
      where: { isDefault: true },
      include: {
        storeCategories: {
          where: { storeId },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => ({
      ...cat,
      storeCategory: cat.storeCategories[0] || undefined,
    }));
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
    });
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

    return prisma.category.create({
      data: {
        ...input,
        isDefault: false,
      },
    });
  }

  /**
   * Update a category
   */
  async update(id: string, data: IUpdateCategoryInput): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Prevent updating default categories
    if (category.isDefault) {
      throw new ValidationError('Cannot update default categories');
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a custom category
   */
  async delete(id: string): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.isDefault) {
      throw new ValidationError('Cannot delete default categories');
    }

    await prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Customize categories for a specific store
   */
  async customizeForStore(
    storeId: string,
    customizations: IStoreCategoryInput[]
  ): Promise<StoreCategory[]> {
    // Delete existing customizations
    await prisma.storeCategory.deleteMany({
      where: { storeId },
    });

    // Create new customizations
    return prisma.$transaction(
      customizations.map((custom) =>
        prisma.storeCategory.create({
          data: {
            storeId,
            categoryId: custom.categoryId,
            aisleNumber: custom.aisleNumber,
            customName: custom.customName,
            sortOrder: custom.sortOrder,
          },
        })
      )
    );
  }

  /**
   * Update store category order
   */
  async updateStoreOrder(
    storeId: string,
    categoryIds: string[]
  ): Promise<void> {
    await prisma.$transaction(
      categoryIds.map((categoryId, index) =>
        prisma.storeCategory.updateMany({
          where: { storeId, categoryId },
          data: { sortOrder: index },
        })
      )
    );
  }

  /**
   * Search categories by name
   */
  async search(query: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
      take: 10,
    });
  }

  /**
   * Get category usage statistics
   */
  async getUsageStats(userId: string): Promise<ICategoryWithCount[]> {
    const categories = await prisma.category.findMany({
      where: { isDefault: true },
    });

    const stats = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.listItem.count({
          where: {
            categoryId: category.id,
            list: {
              OR: [
                { ownerId: userId },
                { collaborators: { some: { userId } } },
              ],
            },
          },
        });

        return {
          ...category,
          itemCount: count,
        };
      })
    );

    return stats.sort((a, b) => b.itemCount - a.itemCount);
  }

  /**
   * Find best matching category for item name
   */
  async findBestMatch(itemName: string): Promise<Category | null> {
    // Simple keyword matching
    const keywords = itemName.toLowerCase().split(' ');

    const categories = await prisma.category.findMany({
      where: { isDefault: true },
    });

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
