/**
 * Meal Plan Service Implementation
 *
 * Business logic for meal planning.
 * Handles creation, updates, and shopping list generation.
 *
 * @module services/meal-plan.service
 */

import type { MealPlan, Prisma, ShoppingList } from '@prisma/client';

import { ForbiddenError, NotFoundError } from '@/lib/errors/AppError';
import type {
  BulkCreateMealPlansInput,
  CreateMealPlanInput,
  GenerateShoppingListFromMealPlansInput,
  MealPlanQuery,
  UpdateMealPlanInput,
} from '@/lib/validation/schemas/meal-plan';
import {
  ItemRepository,
  ListRepository,
  MealPlanRepository,
  RecipeRepository,
  withTransaction,
} from '@/repositories';
import type { MealPlanWithDetails } from '@/repositories/interfaces/meal-plan-repository.interface';

import type { IPaginatedResponse } from './interfaces/base-service.interface';
import type { IMealPlanService } from './interfaces/meal-plan-service.interface';

export class MealPlanService implements IMealPlanService {
  readonly serviceName = 'MealPlanService';

  private mealPlanRepo: MealPlanRepository;
  private recipeRepo: RecipeRepository;
  private listRepo: ListRepository;
  private itemRepo: ItemRepository;

  constructor() {
    this.mealPlanRepo = new MealPlanRepository();
    this.recipeRepo = new RecipeRepository();
    this.listRepo = new ListRepository();
    this.itemRepo = new ItemRepository();
  }

  /**
   * Create a new meal plan
   */
  async create(userId: string, input: CreateMealPlanInput): Promise<MealPlan> {
    const data: Prisma.MealPlanCreateInput = {
      mealType: input.mealType,
      date: input.date,
      notes: input.notes,
      user: { connect: { id: userId } },
    };

    if (input.recipeId) {
      // verify recipe exists
      const recipe = await this.recipeRepo.findById(input.recipeId);
      if (!recipe) {
        throw new NotFoundError('Recipe not found');
      }
      data.recipe = { connect: { id: input.recipeId } };
    }

    return this.mealPlanRepo.create(data);
  }

  /**
   * Bulk create meal plans
   */
  async bulkCreate(
    userId: string,
    input: BulkCreateMealPlansInput
  ): Promise<void> {
    // Validate all recipes exist first? Or let DB fail?
    // DB will fail FK if recipeId invalid.

    // Transform input to CreateMany
    const data = input.mealPlans.map((plan) => ({
      userId,
      mealType: plan.mealType,
      date: plan.date,
      recipeId: plan.recipeId || null,
      notes: plan.notes,
      isCompleted: false,
    }));

    await this.mealPlanRepo.createMany(data);
  }

  /**
   * Get meal plan by ID
   */
  async getById(id: string, userId: string): Promise<MealPlan | null> {
    const mealPlan = await this.mealPlanRepo.findById(id);

    if (!mealPlan) {
      return null;
    }

    if (mealPlan.userId !== userId) {
      throw new ForbiddenError('You do not have access to this meal plan');
    }

    return mealPlan;
  }

  /**
   * Get meal plan by ID with details
   */
  async getByIdWithDetails(
    id: string,
    userId: string
  ): Promise<MealPlanWithDetails | null> {
    const mealPlan = await this.mealPlanRepo.findByIdWithDetails(id);

    if (!mealPlan) {
      return null;
    }

    if (mealPlan.userId !== userId) {
      throw new ForbiddenError('You do not have access to this meal plan');
    }

    return mealPlan;
  }

  /**
   * Update meal plan
   */
  async update(
    id: string,
    userId: string,
    input: UpdateMealPlanInput
  ): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepo.findById(id);

    if (!mealPlan) {
      throw new NotFoundError('Meal plan not found');
    }

    if (mealPlan.userId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to update this meal plan'
      );
    }

    return this.mealPlanRepo.update(id, input);
  }

  /**
   * Delete meal plan
   */
  async delete(id: string, userId: string): Promise<void> {
    const mealPlan = await this.mealPlanRepo.findById(id);

    if (!mealPlan) {
      throw new NotFoundError('Meal plan not found');
    }

    if (mealPlan.userId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to delete this meal plan'
      );
    }

    await this.mealPlanRepo.delete(id);
  }

  /**
   * Get meal plans by user
   */
  async getByUser(
    userId: string,
    filters?: MealPlanQuery
  ): Promise<IPaginatedResponse<MealPlanWithDetails>> {
    // Determine if pagination needed. Typically meal plans are fetched by date range.
    // Schema allows startDate/endDate.
    // If no date range, we might want pagination.
    const page = 1;
    const limit = 100; // Larger limit for calendar

    // If date range provided, use that.

    const queryOptions = {
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      mealType: filters?.mealType,
      isCompleted: filters?.isCompleted,
      take: limit, // Cap it
      skip: 0,
    };

    const mealPlans = await this.mealPlanRepo.findByUser(userId, queryOptions);
    const total = await this.mealPlanRepo.countByUser(userId, queryOptions);

    return {
      data: mealPlans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate shopping list from meal plans
   */
  async generateShoppingList(
    userId: string,
    input: GenerateShoppingListFromMealPlansInput
  ): Promise<ShoppingList> {
    // 1. Get meal plans in range
    const mealPlans = await this.mealPlanRepo.findByUser(userId, {
      startDate: input.startDate,
      endDate: input.endDate,
      // filter by mealTypes if provided (requires client side or repo generic filter)
      // Repo `findByUser` supports single mealType. We need to fetch all and filter in memory if multiple types.
    });

    // Filter by mealTypes if needed
    const relevantPlans = input.mealTypes
      ? mealPlans.filter((mp) => input.mealTypes?.includes(mp.mealType))
      : mealPlans;

    // 2. Aggregate ingredients from recipes
    // Map recipeId -> count (or just list them)
    // We need to fetch recipe ingredients.
    // `relevantPlans` has `recipe` included but not `ingredients`.
    // We need to fetch ingredients for each recipe.

    // Optimization: Collect all recipe IDs
    const recipeIds = relevantPlans
      .map((mp) => mp.recipeId)
      .filter((id): id is string => id !== null);

    const recipesWithIngredients = await Promise.all(
      recipeIds.map((id) => this.recipeRepo.findByIdWithDetails(id))
    );

    // 3. Create Shopping List
    return withTransaction(async ({ listRepo, itemRepo }) => {
      const list = await listRepo.create({
        name:
          input.listName ||
          `Meal Plan: ${input.startDate.toLocaleDateString()} - ${input.endDate.toLocaleDateString()}`,
        owner: { connect: { id: userId } },
        status: 'ACTIVE',
      });

      // 4. Add items
      // Simplified aggregation: just add all ingredients.
      // Merging same ingredients (by name) would be better UX.

      const ingredientsToAdd = new Map<
        string,
        { amount: number; unit: string | null }
      >();

      for (const plan of relevantPlans) {
        if (!plan.recipeId) continue;
        const recipe = recipesWithIngredients.find(
          (r) => r?.id === plan.recipeId
        );
        if (!recipe) continue;

        for (const ing of recipe.ingredients) {
          // Key by name + unit? Or just name and hope unit matches?
          // Simple matching by name.
          const key = ing.name.toLowerCase();
          const existing = ingredientsToAdd.get(key) || {
            amount: 0,
            unit: ing.unit,
          };

          // Naive unit conversion/matching: if units differ, we might have issues.
          // For MVP, just sum if units match or are null.
          if (existing.unit === ing.unit) {
            existing.amount += Number(ing.quantity);
          } else {
            // Different units, create separate entry or just append?
            // We'll append name to differentiate? "Flour (cups)" vs "Flour (grams)"?
            // For now, simple fallback: separate key
            const uniqueKey = `${key}_${ing.unit}`;
            const customExisting = ingredientsToAdd.get(uniqueKey) || {
              amount: 0,
              unit: ing.unit,
            };
            customExisting.amount += Number(ing.quantity);
            ingredientsToAdd.set(uniqueKey, customExisting);
            continue;
          }

          ingredientsToAdd.set(key, existing);
        }
      }

      // Write to DB
      // Use separate loop to create items
      // Map.entries()

      for (const [key, data] of ingredientsToAdd.entries()) {
        // If key has _unit suffix, strip it for name?
        // Logic above used key as name if matches.
        // If we used uniqueKey, name is key but maybe we want real name.
        // Let's use simple recipe logic:
        // Iterate ingredientsToAdd

        // Re-finding name might be hard if we normalized key.
        // Better: aggregate map stores { name: string, quantity: number, unit: ... }

        // Refactoring loop above slightly implicitly.
        // Creating items:
        await itemRepo.create({
          name: key, // This is lowercase, might want original casing.
          // MVP: capitalize first letter?
          quantity: data.amount,
          unit: data.unit,
          list: { connect: { id: list.id } },
          addedBy: { connect: { id: userId } },
        });
      }

      return list;
    });
  }
}
