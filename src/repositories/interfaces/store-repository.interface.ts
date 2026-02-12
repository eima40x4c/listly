/**
 * Store Repository Interface
 *
 * Data access contract for store operations.
 *
 * @module repositories/interfaces/store-repository.interface
 */

import type { Prisma, Store } from '@prisma/client';

import type {
  IBaseRepository,
  QueryOptions,
} from './base-repository.interface';

/**
 * Store with favorite status for a user
 */
export type StoreWithFavorite = Store & {
  isFavorite: boolean;
};

/**
 * Store with distance from a location
 */
export type StoreWithDistance = Store & {
  distance: number; // in kilometers
};

/**
 * Store Repository Interface
 */
export interface IStoreRepository extends IBaseRepository<Store> {
  /**
   * Create a new store
   */
  create(data: Prisma.StoreCreateInput): Promise<Store>;

  /**
   * Find a store by ID
   */
  findById(id: string): Promise<Store | null>;

  /**
   * Update a store
   */
  update(id: string, data: Prisma.StoreUpdateInput): Promise<Store>;

  /**
   * Delete a store
   */
  delete(id: string): Promise<void>;

  /**
   * Find all stores with pagination
   */
  findAll(options?: QueryOptions): Promise<Store[]>;

  /**
   * Find stores by chain
   */
  findByChain(chain: string): Promise<Store[]>;

  /**
   * Search stores by name or chain
   */
  search(query: string, options?: QueryOptions): Promise<Store[]>;

  /**
   * Find stores near a location
   */
  findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<StoreWithDistance[]>;

  /**
   * Find user's favorite stores
   */
  findFavorites(userId: string): Promise<Store[]>;

  /**
   * Check if store is favorited by user
   */
  isFavorite(storeId: string, userId: string): Promise<boolean>;

  /**
   * Add store to user's favorites
   */
  addFavorite(storeId: string, userId: string): Promise<void>;

  /**
   * Remove store from user's favorites
   */
  removeFavorite(storeId: string, userId: string): Promise<void>;

  /**
   * Count total stores
   */
  count(): Promise<number>;

  /**
   * Find all stores with filter, pagination, and sorting
   */
  findAllFiltered(
    where: Prisma.StoreWhereInput,
    options: { skip: number; take: number; orderBy?: Record<string, string> }
  ): Promise<{ stores: Store[]; total: number }>;

  /**
   * Get user's favorite stores with store details
   */
  getFavoritesWithStore(
    userId: string
  ): Promise<Array<Store & { isFavorite: boolean }>>;

  /**
   * Reorder user's favorite stores
   */
  reorderFavorites(userId: string, storeIds: string[]): Promise<void>;
}
