/**
 * Pantry Repository Unit Tests
 *
 * Tests for PantryRepository methods using mocked Prisma client.
 */

import type { PantryItem, Prisma, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PantryRepository } from '@/repositories/pantry.repository';

// Mock Prisma client
const mockPrismaClient = {
  pantryItem: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('PantryRepository', () => {
  let repository: PantryRepository;
  let mockItem: PantryItem;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create repository instance with mocked Prisma
    repository = new PantryRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    // Mock data
    mockItem = {
      id: 'pantry-123',
      name: 'Flour',
      quantity: 1, // Actually Decimal in DB, but Prisma mock usually accepts number if loose or we cast
      unit: 'kg',
      location: 'pantry',
      barcode: null,
      expirationDate: new Date('2025-01-01'),
      purchaseDate: new Date('2024-01-01'),
      purchasePrice: null,
      notes: null,
      isConsumed: false,
      userId: 'user-123',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as PantryItem; // Casting because Decimal/etc might differ in strict mock types
  });

  describe('create', () => {
    it('should create a new pantry item', async () => {
      mockPrismaClient.pantryItem.create.mockResolvedValue(mockItem);

      const input: Prisma.PantryItemCreateInput = {
        name: 'Flour',
        quantity: 1,
        user: { connect: { id: 'user-123' } },
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.pantryItem.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockItem);
    });
  });

  describe('findById', () => {
    it('should find an item by ID', async () => {
      mockPrismaClient.pantryItem.findUnique.mockResolvedValue(mockItem);

      const result = await repository.findById('pantry-123');

      expect(mockPrismaClient.pantryItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'pantry-123' },
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      mockPrismaClient.pantryItem.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find an item by ID with details', async () => {
      const mockItemWithDetails = {
        ...mockItem,
        category: { id: 'cat-1', name: 'Baking', icon: '🍞', color: '#fff' },
      };
      mockPrismaClient.pantryItem.findUnique.mockResolvedValue(
        mockItemWithDetails
      );

      const result = await repository.findByIdWithDetails('pantry-123');

      expect(mockPrismaClient.pantryItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'pantry-123' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      });
      expect(result).toEqual(mockItemWithDetails);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const updatedItem = { ...mockItem, quantity: 2 };
      mockPrismaClient.pantryItem.update.mockResolvedValue(updatedItem);

      const result = await repository.update('pantry-123', {
        quantity: 2,
      });

      expect(mockPrismaClient.pantryItem.update).toHaveBeenCalledWith({
        where: { id: 'pantry-123' },
        data: { quantity: 2 },
      });
      expect(result).toEqual(updatedItem);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      mockPrismaClient.pantryItem.delete.mockResolvedValue(mockItem);

      await repository.delete('pantry-123');

      expect(mockPrismaClient.pantryItem.delete).toHaveBeenCalledWith({
        where: { id: 'pantry-123' },
      });
    });
  });

  describe('findByUser', () => {
    it('should find items for user', async () => {
      const items = [mockItem];
      mockPrismaClient.pantryItem.findMany.mockResolvedValue(items);

      const result = await repository.findByUser('user-123');

      expect(mockPrismaClient.pantryItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        skip: 0,
        take: 50,
        orderBy: { expirationDate: 'asc' },
        include: expect.any(Object),
      });
      expect(result).toEqual(items);
    });

    it('should apply filters', async () => {
      const items = [mockItem];
      mockPrismaClient.pantryItem.findMany.mockResolvedValue(items);

      await repository.findByUser('user-123', {
        location: 'pantry',
        isConsumed: false,
      });

      expect(mockPrismaClient.pantryItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
            location: 'pantry',
            isConsumed: false,
          }),
        })
      );
    });
  });

  describe('findExpiringSoon', () => {
    it('should find expiring items', async () => {
      const items = [mockItem];
      mockPrismaClient.pantryItem.findMany.mockResolvedValue(items);

      const result = await repository.findExpiringSoon('user-123', 7);

      expect(mockPrismaClient.pantryItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
            isConsumed: false,
            expirationDate: expect.objectContaining({
              lte: expect.any(Date),
            }),
          }),
        })
      );
      expect(result).toEqual(items);
    });
  });

  describe('isOwner', () => {
    it('should return true when user is owner', async () => {
      mockPrismaClient.pantryItem.findFirst.mockResolvedValue(mockItem);

      const result = await repository.isOwner('pantry-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false when user is not owner', async () => {
      mockPrismaClient.pantryItem.findFirst.mockResolvedValue(null);

      const result = await repository.isOwner('pantry-123', 'other-user');

      expect(result).toBe(false);
    });
  });
});
