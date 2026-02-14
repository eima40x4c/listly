/**
 * Recipe Repository Unit Tests
 *
 * Tests for RecipeRepository methods using mocked Prisma client.
 */

import type { Prisma, PrismaClient, Recipe } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecipeRepository } from '@/repositories/recipe.repository';

// Mock Prisma client
const mockPrismaClient = {
  recipe: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('RecipeRepository', () => {
  let repository: RecipeRepository;
  let mockRecipe: Recipe;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new RecipeRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockRecipe = {
      id: 'recipe-123',
      title: 'Pancakes',
      description: 'Fluffy pancakes',
      instructions: 'Mix and cook',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'American',
      imageUrl: null,
      sourceUrl: null,
      isPublic: false,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new recipe', async () => {
      mockPrismaClient.recipe.create.mockResolvedValue(mockRecipe);

      const input: Prisma.RecipeCreateInput = {
        title: 'Pancakes',
        instructions: 'Mix',
        user: { connect: { id: 'user-123' } },
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.recipe.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find recipe with details', async () => {
      const mockWithDetails = { ...mockRecipe, ingredients: [] };
      mockPrismaClient.recipe.findUnique.mockResolvedValue(mockWithDetails);

      const result = await repository.findByIdWithDetails('recipe-123');

      expect(mockPrismaClient.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
        include: {
          ingredients: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      expect(result).toEqual(mockWithDetails);
    });
  });

  describe('findByUser', () => {
    it('should find recipes for user', async () => {
      const recipes = [mockRecipe];
      mockPrismaClient.recipe.findMany.mockResolvedValue(recipes);

      const result = await repository.findByUser('user-123');

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-123' }),
        })
      );
      expect(result).toEqual(recipes);
    });
  });

  describe('findPublic', () => {
    it('should find public recipes', async () => {
      const recipes = [{ ...mockRecipe, isPublic: true }];
      mockPrismaClient.recipe.findMany.mockResolvedValue(recipes);

      const result = await repository.findPublic();

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isPublic: true }),
        })
      );
      expect(result).toEqual(recipes);
    });
  });
});
