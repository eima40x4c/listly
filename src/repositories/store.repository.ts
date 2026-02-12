/**
 * Store Repository Implementation
 *
 * Data access layer for store operations.
 * Encapsulates all Prisma queries for stores.
 *
 * @module repositories/store.repository
 */

import type { Prisma, PrismaClient, Store } from '@prisma/client';

import { BaseRepository } from './base.repository';
import type {
  IStoreRepository,
  QueryOptions,
  StoreWithDistance,
} from './interfaces';

export class StoreRepository
  extends BaseRepository<Store>
  implements IStoreRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new store
   */
  async create(data: Prisma.StoreCreateInput): Promise<Store> {
    return (this.db as PrismaClient).store.create({ data });
  }

  /**
   * Find a store by ID
   */
  async findById(id: string): Promise<Store | null> {
    return (this.db as PrismaClient).store.findUnique({
      where: { id },
    });
  }

  /**
   * Update a store
   */
  async update(id: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    return (this.db as PrismaClient).store.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a store
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).store.delete({
      where: { id },
    });
  }

  /**
   * Find all stores with pagination
   */
  async findAll(options: QueryOptions = {}): Promise<Store[]> {
    const { skip = 0, take = 50, orderBy = 'name', order = 'asc' } = options;

    return (this.db as PrismaClient).store.findMany({
      skip,
      take,
      orderBy: { [orderBy]: order },
    });
  }

  /**
   * Find stores by chain
   */
  async findByChain(chain: string): Promise<Store[]> {
    return (this.db as PrismaClient).store.findMany({
      where: { chain },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Search stores by name or chain
   */
  async search(query: string, options: QueryOptions = {}): Promise<Store[]> {
    const { skip = 0, take = 50 } = options;

    return (this.db as PrismaClient).store.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { chain: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find stores near a location
   * Uses Haversine formula for distance calculation
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<StoreWithDistance[]> {
    // Get all stores with coordinates
    const stores = await (this.db as PrismaClient).store.findMany({
      where: {
        AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
      },
    });

    // Calculate distance for each store
    const storesWithDistance = stores
      .map((store) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          Number(store.latitude),
          Number(store.longitude)
        );

        return {
          ...store,
          distance,
        };
      })
      .filter((store) => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return storesWithDistance;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find user's favorite stores
   */
  async findFavorites(userId: string): Promise<Store[]> {
    const favorites = await (
      this.db as PrismaClient
    ).userFavoriteStore.findMany({
      where: { userId },
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => fav.store);
  }

  /**
   * Check if store is favorited by user
   */
  async isFavorite(storeId: string, userId: string): Promise<boolean> {
    const favorite = await (
      this.db as PrismaClient
    ).userFavoriteStore.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });
    return favorite !== null;
  }

  /**
   * Add store to user's favorites
   */
  async addFavorite(storeId: string, userId: string): Promise<void> {
    await (this.db as PrismaClient).userFavoriteStore.create({
      data: {
        userId,
        storeId,
      },
    });
  }

  /**
   * Remove store from user's favorites
   */
  async removeFavorite(storeId: string, userId: string): Promise<void> {
    await (this.db as PrismaClient).userFavoriteStore.delete({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });
  }

  /**
   * Count total stores
   */
  async count(): Promise<number> {
    return (this.db as PrismaClient).store.count();
  }

  /**
   * Find all stores with filter, pagination, and sorting
   */
  async findAllFiltered(
    where: Prisma.StoreWhereInput,
    options: { skip: number; take: number; orderBy?: Record<string, string> }
  ): Promise<{ stores: Store[]; total: number }> {
    const [stores, total] = await Promise.all([
      (this.db as PrismaClient).store.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy || { name: 'asc' },
      }),
      (this.db as PrismaClient).store.count({ where }),
    ]);

    return { stores, total };
  }

  /**
   * Get user's favorite stores with store details
   */
  async getFavoritesWithStore(
    userId: string
  ): Promise<Array<Store & { isFavorite: boolean }>> {
    const favorites = await (
      this.db as PrismaClient
    ).userFavoriteStore.findMany({
      where: { userId },
      include: { store: true },
      orderBy: { createdAt: 'asc' },
    });

    return favorites.map((fav) => ({
      ...fav.store,
      isFavorite: true,
    }));
  }

  /**
   * Reorder user's favorite stores
   */
  async reorderFavorites(userId: string, storeIds: string[]): Promise<void> {
    await (this.db as PrismaClient).$transaction(async (tx) => {
      // Delete all current favorites
      await tx.userFavoriteStore.deleteMany({
        where: { userId },
      });

      // Re-add in new order
      for (const storeId of storeIds) {
        await tx.userFavoriteStore.create({
          data: { userId, storeId },
        });
      }
    });
  }
}
