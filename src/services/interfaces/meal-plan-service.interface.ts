/**
 * Meal Plan Service Interface
 *
 * Business logic layer interface for meal planning operations.
 *
 * @module services/interfaces/meal-plan-service.interface
 */

import type { MealPlan, ShoppingList } from '@prisma/client';

import type {
  BulkCreateMealPlansInput,
  CreateMealPlanInput,
  GenerateShoppingListFromMealPlansInput,
  MealPlanQuery,
  UpdateMealPlanInput,
} from '@/lib/validation/schemas/meal-plan';
import type { MealPlanWithDetails } from '@/repositories/interfaces/meal-plan-repository.interface';

import type {
  IBaseService,
  IPaginatedResponse,
} from './base-service.interface';

export interface IMealPlanService extends IBaseService {
  create(userId: string, input: CreateMealPlanInput): Promise<MealPlan>;
  bulkCreate(userId: string, input: BulkCreateMealPlansInput): Promise<void>;

  getById(id: string, userId: string): Promise<MealPlan | null>;
  getByIdWithDetails(
    id: string,
    userId: string
  ): Promise<MealPlanWithDetails | null>;

  update(
    id: string,
    userId: string,
    input: UpdateMealPlanInput
  ): Promise<MealPlan>;

  delete(id: string, userId: string): Promise<void>;

  getByUser(
    userId: string,
    filters?: MealPlanQuery
  ): Promise<IPaginatedResponse<MealPlanWithDetails>>;

  generateShoppingList(
    userId: string,
    input: GenerateShoppingListFromMealPlansInput
  ): Promise<ShoppingList>;
}
