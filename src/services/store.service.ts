/**
 * Store Service Implementation
 *
 * Business logic for store management.
 * Handles store CRUD, user favorites, and location-based queries.
 *
 * @module services/store.service
 */

import type { Prisma, Store } from '@prisma/client';

import { NotFoundError } from '@/lib/errors/AppError';
import { StoreRepository } from '@/repositories';

import type {
  ICreateStoreInput,
  IPaginatedResponse,
  IStoreFilters,
  IStoreService,
  IStoreWithDistance,
  IStoreWithFavorite,
  IUpdateStoreInput,
} from './interfaces';

export class StoreService implements IStoreService {
  readonly serviceName = 'StoreService';

  private storeRepo: StoreRepository;

  constructor() {
    this.storeRepo = new StoreRepository();
  }

  /**
   * Get all stores with pagination and filters
   */
  async getAll(filters?: IStoreFilters): Promise<IPaginatedResponse<Store>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {};

    if (filters?.chain) {
      where.chain = filters.chain;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { chain: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const { stores, total } = await this.storeRepo.findAllFiltered(where, {
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    });

    return {
      data: stores,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get store by ID
   */
  async getById(id: string): Promise<Store | null> {
    return this.storeRepo.findById(id);
  }

  /**
   * Search stores
   */
  async search(query: string, limit = 10): Promise<Store[]> {
    return this.storeRepo.search(query, { take: limit });
  }

  /**
   * Find nearby stores (requires geolocation)
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm = 10
  ): Promise<IStoreWithDistance[]> {
    return this.storeRepo.findNearby(latitude, longitude, radiusKm);
  }

  /**
   * Create a new store
   */
  async create(input: ICreateStoreInput): Promise<Store> {
    return this.storeRepo.create(input);
  }

  /**
   * Update a store
   */
  async update(id: string, data: IUpdateStoreInput): Promise<Store> {
    const store = await this.getById(id);
    if (!store) {
      throw new NotFoundError('Store not found');
    }

    return this.storeRepo.update(id, data);
  }

  /**
   * Delete a store
   */
  async delete(id: string): Promise<void> {
    const store = await this.getById(id);
    if (!store) {
      throw new NotFoundError('Store not found');
    }

    await this.storeRepo.delete(id);
  }

  /**
   * Add store to favorites
   */
  async addFavorite(
    userId: string,
    storeId: string
  ): Promise<Store & { isFavorite: boolean }> {
    // Check if already favorited
    const alreadyFav = await this.storeRepo.isFavorite(storeId, userId);

    if (alreadyFav) {
      const store = await this.storeRepo.findById(storeId);
      return { ...store!, isFavorite: true };
    }

    await this.storeRepo.addFavorite(storeId, userId);
    const store = await this.storeRepo.findById(storeId);
    return { ...store!, isFavorite: true };
  }

  /**
   * Remove store from favorites
   */
  async removeFavorite(userId: string, storeId: string): Promise<void> {
    await this.storeRepo.removeFavorite(storeId, userId);
  }

  /**
   * Get user's favorite stores
   */
  async getFavorites(userId: string): Promise<IStoreWithFavorite[]> {
    return this.storeRepo.getFavoritesWithStore(userId);
  }

  /**
   * Reorder favorites
   */
  async reorderFavorites(userId: string, storeIds: string[]): Promise<void> {
    await this.storeRepo.reorderFavorites(userId, storeIds);
  }

  /**
   * Check if store is favorited
   */
  async isFavorite(userId: string, storeId: string): Promise<boolean> {
    return this.storeRepo.isFavorite(storeId, userId);
  }

  /**
   * Get stores by chain
   */
  async getByChain(chain: string): Promise<Store[]> {
    return this.storeRepo.findByChain(chain);
  }
}
