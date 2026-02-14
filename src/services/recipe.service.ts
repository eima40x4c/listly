/**
 * Recipe Service Implementation
 *
 * Business logic for recipe management.
 * Handles recipe creation, updates, and ingredient management.
 *
 * @module services/recipe.service
 */

import type { Prisma, Recipe } from '@prisma/client';

import { ForbiddenError, NotFoundError } from '@/lib/errors/AppError';
import type {
  CreateRecipeInput,
  RecipeQuery,
  UpdateRecipeInput,
} from '@/lib/validation/schemas/recipe';
import { RecipeRepository } from '@/repositories';
import type { RecipeWithDetails } from '@/repositories/interfaces/recipe-repository.interface';

import type { IPaginatedResponse } from './interfaces/base-service.interface';
import type { IRecipeService } from './interfaces/recipe-service.interface';

export class RecipeService implements IRecipeService {
  readonly serviceName = 'RecipeService';

  private recipeRepo: RecipeRepository;

  constructor() {
    this.recipeRepo = new RecipeRepository();
  }

  /**
   * Create a new recipe
   */
  async create(userId: string, input: CreateRecipeInput): Promise<Recipe> {
    const data: Prisma.RecipeCreateInput = {
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      prepTime: input.prepTime,
      cookTime: input.cookTime,
      servings: input.servings,
      difficulty: input.difficulty,
      cuisine: input.cuisine,
      imageUrl: input.imageUrl,
      sourceUrl: input.sourceUrl,
      isPublic: input.isPublic,
      user: { connect: { id: userId } },
    };

    if (input.ingredients && input.ingredients.length > 0) {
      data.ingredients = {
        create: input.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
          sortOrder: ing.sortOrder,
        })),
      };
    }

    return this.recipeRepo.create(data);
  }

  /**
   * Get recipe by ID
   */
  async getById(id: string, userId?: string): Promise<Recipe | null> {
    const recipe = await this.recipeRepo.findById(id);

    if (!recipe) {
      return null;
    }

    // Business rule: If private, only owner can view
    if (!recipe.isPublic && userId && recipe.userId !== userId) {
      throw new ForbiddenError('You do not have access to this recipe');
    }

    return recipe;
  }

  /**
   * Get recipe by ID with details
   */
  async getByIdWithDetails(
    id: string,
    userId?: string
  ): Promise<RecipeWithDetails | null> {
    const recipe = await this.recipeRepo.findByIdWithDetails(id);

    if (!recipe) {
      return null;
    }

    // Business rule: If private, only owner can view
    if (!recipe.isPublic && userId && recipe.userId !== userId) {
      throw new ForbiddenError('You do not have access to this recipe');
    }

    return recipe;
  }

  /**
   * Update recipe
   */
  async update(
    id: string,
    userId: string,
    input: UpdateRecipeInput
  ): Promise<Recipe> {
    const recipe = await this.recipeRepo.findById(id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    // Business rule: Only owner can update
    if (recipe.userId !== userId) {
      throw new ForbiddenError('Only the recipe owner can update this recipe');
    }

    return this.recipeRepo.update(id, input);
  }

  /**
   * Delete recipe
   */
  async delete(id: string, userId: string): Promise<void> {
    const recipe = await this.recipeRepo.findById(id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    // Business rule: Only owner can delete
    if (recipe.userId !== userId) {
      throw new ForbiddenError('Only the recipe owner can delete this recipe');
    }

    await this.recipeRepo.delete(id);
  }

  /**
   * Get recipes by user
   */
  async getByUser(
    userId: string,
    filters?: RecipeQuery
  ): Promise<IPaginatedResponse<RecipeWithDetails>> {
    const page = 1; // Default
    const limit = 50; // Default
    const skip = (page - 1) * limit;

    const queryOptions = {
      skip,
      take: limit,
      cuisine: filters?.cuisine,
      difficulty: filters?.difficulty,
      maxTime: filters?.maxTime,
      isPublic: filters?.isPublic,
      search: filters?.q,
    };

    const [recipes, total] = await Promise.all([
      this.recipeRepo.findByUser(userId, queryOptions),
      this.recipeRepo.countByUser(userId, queryOptions),
    ]);

    return {
      data: recipes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get public recipes
   */
  async getPublic(
    filters?: RecipeQuery
  ): Promise<IPaginatedResponse<RecipeWithDetails>> {
    const page = 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const queryOptions = {
      skip,
      take: limit,
      cuisine: filters?.cuisine,
      difficulty: filters?.difficulty,
      search: filters?.q,
    };

    const [recipes, total] = await Promise.all([
      this.recipeRepo.findPublic(queryOptions),
      this.recipeRepo.countPublic(queryOptions),
    ]);

    return {
      data: recipes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
