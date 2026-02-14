/**
 * Recipe Repository Interface
 *
 * Data access layer interface for recipe operations.
 *
 * @module repositories/interfaces/recipe-repository.interface
 */

import type { Prisma, Recipe, RecipeIngredient } from '@prisma/client';

import type {
  IBaseRepository,
  QueryOptions,
} from './base-repository.interface';

/**
 * Filter options for recipe queries
 */
export interface RecipeQueryOptions extends QueryOptions {
  cuisine?: string;
  difficulty?: string;
  maxTime?: number; // Total time (prep + cook)
  isPublic?: boolean;
  search?: string;
}

/**
 * Extended Recipe with ingredients
 */
export type RecipeWithDetails = Recipe & {
  ingredients: RecipeIngredient[];
};

export interface IRecipeRepository extends IBaseRepository<Recipe> {
  create(data: Prisma.RecipeCreateInput): Promise<Recipe>;
  findById(id: string): Promise<Recipe | null>;
  findByIdWithDetails(id: string): Promise<RecipeWithDetails | null>;
  update(id: string, data: Prisma.RecipeUpdateInput): Promise<Recipe>;
  delete(id: string): Promise<void>;

  findByUser(
    userId: string,
    options?: RecipeQueryOptions
  ): Promise<RecipeWithDetails[]>;
  countByUser(userId: string, options?: RecipeQueryOptions): Promise<number>;

  findPublic(options?: RecipeQueryOptions): Promise<RecipeWithDetails[]>;
  countPublic(options?: RecipeQueryOptions): Promise<number>;

  isOwner(recipeId: string, userId: string): Promise<boolean>;
}
