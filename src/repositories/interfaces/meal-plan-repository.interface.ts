/**
 * Meal Plan Repository Interface
 *
 * Data access layer interface for meal planning operations.
 *
 * @module repositories/interfaces/meal-plan-repository.interface
 */

import type { MealPlan, Prisma, Recipe } from '@prisma/client';

import type {
  IBaseRepository,
  QueryOptions,
} from './base-repository.interface';

/**
 * Filter options for meal plan queries
 */
export interface MealPlanQueryOptions extends QueryOptions {
  startDate?: Date;
  endDate?: Date;
  mealType?: string; // 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'
  isCompleted?: boolean;
}

/**
 * Extended Meal Plan with recipe details
 */
export type MealPlanWithDetails = MealPlan & {
  recipe: Recipe | null;
};

export interface IMealPlanRepository extends IBaseRepository<MealPlan> {
  create(data: Prisma.MealPlanCreateInput): Promise<MealPlan>;
  createMany(data: Prisma.MealPlanCreateManyInput[]): Promise<void>;
  findById(id: string): Promise<MealPlan | null>;
  findByIdWithDetails(id: string): Promise<MealPlanWithDetails | null>;
  update(id: string, data: Prisma.MealPlanUpdateInput): Promise<MealPlan>;
  delete(id: string): Promise<void>;

  findByUser(
    userId: string,
    options?: MealPlanQueryOptions
  ): Promise<MealPlanWithDetails[]>;
  countByUser(userId: string, options?: MealPlanQueryOptions): Promise<number>;

  findConflictingNonCompleted(
    userId: string,
    date: Date,
    mealType: string
  ): Promise<MealPlan[]>;

  isOwner(mealPlanId: string, userId: string): Promise<boolean>;
}
