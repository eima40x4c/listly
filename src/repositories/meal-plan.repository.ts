/**
 * Meal Plan Repository Implementation
 *
 * Data access layer for meal planning operations.
 * Encapsulates all Prisma queries for meal plans.
 *
 * @module repositories/meal-plan.repository
 */

import type { MealPlan, Prisma, PrismaClient } from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  IMealPlanRepository,
  MealPlanQueryOptions,
  MealPlanWithDetails,
} from './interfaces/meal-plan-repository.interface';

export class MealPlanRepository
  extends BaseRepository<MealPlan>
  implements IMealPlanRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new meal plan
   */
  async create(data: Prisma.MealPlanCreateInput): Promise<MealPlan> {
    return (this.db as PrismaClient).mealPlan.create({ data });
  }

  /**
   * Create multiple meal plans
   */
  async createMany(data: Prisma.MealPlanCreateManyInput[]): Promise<void> {
    await (this.db as PrismaClient).mealPlan.createMany({ data });
  }

  /**
   * Find a meal plan by ID
   */
  async findById(id: string): Promise<MealPlan | null> {
    return (this.db as PrismaClient).mealPlan.findUnique({
      where: { id },
    });
  }

  /**
   * Find a meal plan by ID with details
   */
  async findByIdWithDetails(id: string): Promise<MealPlanWithDetails | null> {
    return (this.db as PrismaClient).mealPlan.findUnique({
      where: { id },
      include: {
        recipe: true,
      },
    });
  }

  /**
   * Update a meal plan
   */
  async update(
    id: string,
    data: Prisma.MealPlanUpdateInput
  ): Promise<MealPlan> {
    return (this.db as PrismaClient).mealPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a meal plan
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).mealPlan.delete({
      where: { id },
    });
  }

  /**
   * Find meal plans for a user with filters
   */
  async findByUser(
    userId: string,
    options: MealPlanQueryOptions = {}
  ): Promise<MealPlanWithDetails[]> {
    const {
      skip, // Optional, typically full range for calendar view
      take,
      orderBy = 'date',
      order = 'asc',
      startDate,
      endDate,
      mealType,
      isCompleted,
    } = options;

    const where: Prisma.MealPlanWhereInput = {
      userId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.date = { gte: startDate };
    } else if (endDate) {
      where.date = { lte: endDate };
    }

    if (mealType) {
      // Need to cast string to MealType enum if strict
      where.mealType = mealType as any;
    }

    if (isCompleted !== undefined) where.isCompleted = isCompleted;

    return (this.db as PrismaClient).mealPlan.findMany({
      where,
      skip,
      take,
      orderBy: { [orderBy]: order },
      include: {
        recipe: true,
      },
    });
  }

  /**
   * Count meal plans for a user with filters
   */
  async countByUser(
    userId: string,
    options: MealPlanQueryOptions = {}
  ): Promise<number> {
    const { startDate, endDate, mealType, isCompleted } = options;

    const where: Prisma.MealPlanWhereInput = {
      userId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.date = { gte: startDate };
    } else if (endDate) {
      where.date = { lte: endDate };
    }

    if (mealType) where.mealType = mealType as any;
    if (isCompleted !== undefined) where.isCompleted = isCompleted;

    return (this.db as PrismaClient).mealPlan.count({ where });
  }

  /**
   * Find conflicting meal plans (same type on same day)
   * Note: 'date' in DB might include time?
   * If 'date' is DateTime, we need to check range of that day, or equality if it's normalized.
   * Assuming 'date' stored is start of day or specific time.
   * If strictly one breakfast per day, we check range.
   * But schema says `date DateTime`.
   * Better logic: check if ANY meal plan exists for that type on that calendar day.
   */
  async findConflictingNonCompleted(
    userId: string,
    date: Date,
    mealType: string
  ): Promise<MealPlan[]> {
    // Check range for the specific day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return (this.db as PrismaClient).mealPlan.findMany({
      where: {
        userId,
        mealType: mealType as any,
        isCompleted: false, // Maybe we allow planning multiple if one is done?
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  /**
   * Check if user is the owner of a meal plan
   */
  async isOwner(mealPlanId: string, userId: string): Promise<boolean> {
    const mealPlan = await (this.db as PrismaClient).mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId,
      },
    });
    return mealPlan !== null;
  }
}
