/**
 * Recipe Service Interface
 *
 * Business logic layer interface for recipe operations.
 *
 * @module services/interfaces/recipe-service.interface
 */

import type { Recipe } from '@prisma/client';

import type {
  CreateRecipeInput,
  RecipeQuery,
  UpdateRecipeInput,
} from '@/lib/validation/schemas/recipe';
import type { RecipeWithDetails } from '@/repositories/interfaces/recipe-repository.interface';

import type {
  IBaseService,
  IPaginatedResponse,
} from './base-service.interface';

export interface IRecipeService extends IBaseService {
  create(userId: string, input: CreateRecipeInput): Promise<Recipe>;
  getById(id: string, userId?: string): Promise<Recipe | null>;
  getByIdWithDetails(
    id: string,
    userId?: string
  ): Promise<RecipeWithDetails | null>;
  update(id: string, userId: string, input: UpdateRecipeInput): Promise<Recipe>;
  delete(id: string, userId: string): Promise<void>;

  getByUser(
    userId: string,
    filters?: RecipeQuery
  ): Promise<IPaginatedResponse<RecipeWithDetails>>;

  getPublic(
    filters?: RecipeQuery
  ): Promise<IPaginatedResponse<RecipeWithDetails>>;

  // Future: Import from URL
  // importFromUrl(url: string, userId: string): Promise<Recipe>;
}
