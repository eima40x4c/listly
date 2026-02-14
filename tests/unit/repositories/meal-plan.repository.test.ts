/**
 * Meal Plan Repository Unit Tests
 *
 * Tests for MealPlanRepository methods using mocked Prisma client.
 */

import type { MealPlan, Prisma, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealPlanRepository } from '@/repositories/meal-plan.repository';

// Mock Prisma client
const mockPrismaClient = {
  mealPlan: {
    create: vi.fn(),
    createMany: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('MealPlanRepository', () => {
  let repository: MealPlanRepository;
  let mockMealPlan: MealPlan;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new MealPlanRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockMealPlan = {
      id: 'mp-123',
      date: new Date('2025-01-01'),
      mealType: 'DINNER',
      recipeId: 'recipe-123',
      notes: null,
      isCompleted: false,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new meal plan', async () => {
      mockPrismaClient.mealPlan.create.mockResolvedValue(mockMealPlan);

      const input: Prisma.MealPlanCreateInput = {
        date: new Date('2025-01-01'),
        mealType: 'DINNER',
        user: { connect: { id: 'user-123' } },
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.mealPlan.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockMealPlan);
    });
  });

  describe('createMany', () => {
    it('should create multiple meal plans', async () => {
      mockPrismaClient.mealPlan.createMany.mockResolvedValue({ count: 2 });

      const input: Prisma.MealPlanCreateManyInput[] = [
        { userId: 'user-123', date: new Date(), mealType: 'LUNCH' },
        { userId: 'user-123', date: new Date(), mealType: 'DINNER' },
      ];

      await repository.createMany(input);

      expect(mockPrismaClient.mealPlan.createMany).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('findByUser', () => {
    it('should find meal plans for user', async () => {
      const plans = [mockMealPlan];
      mockPrismaClient.mealPlan.findMany.mockResolvedValue(plans);

      const result = await repository.findByUser('user-123');

      expect(mockPrismaClient.mealPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-123' }),
        })
      );
      expect(result).toEqual(plans);
    });

    it('should filter by date range', async () => {
      await repository.findByUser('user-123', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-07'),
      });

      expect(mockPrismaClient.mealPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });
});
