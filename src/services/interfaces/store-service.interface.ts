/**
 * Store Service Interface
 *
 * Defines the contract for store management.
 * Handles store CRUD, user favorites, and location-based features.
 *
 * @module services/interfaces/store-service.interface
 */

import type { Store, UserFavoriteStore } from '@prisma/client';

import type {
  IBaseService,
  IPaginatedResponse,
  IPaginationOptions,
} from './base-service.interface';

/**
 * Input for creating a store
 */
export interface ICreateStoreInput {
  name: string;
  chain?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Input for updating a store
 */
export interface IUpdateStoreInput {
  name?: string;
  chain?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Store search filters
 */
export interface IStoreFilters extends IPaginationOptions {
  chain?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // In kilometers
}

/**
 * Store with distance (for location-based queries)
 */
export interface IStoreWithDistance extends Store {
  distance?: number; // In kilometers
}

/**
 * Store with favorite status
 */
export interface IStoreWithFavorite extends Store {
  isFavorite: boolean;
  favoriteOrder?: number;
}

/**
 * Store Service Interface
 */
export interface IStoreService extends IBaseService {
  /**
   * Get all stores
   */
  getAll(filters?: IStoreFilters): Promise<IPaginatedResponse<Store>>;

  /**
   * Get store by ID
   */
  getById(id: string): Promise<Store | null>;

  /**
   * Search stores by name or chain
   */
  search(query: string, limit?: number): Promise<Store[]>;

  /**
   * Find nearby stores
   */
  findNearby(
    latitude: number,
    longitude: number,
    radiusKm?: number
  ): Promise<IStoreWithDistance[]>;

  /**
   * Create a new store
   */
  create(input: ICreateStoreInput): Promise<Store>;

  /**
   * Update a store
   */
  update(id: string, data: IUpdateStoreInput): Promise<Store>;

  /**
   * Delete a store
   */
  delete(id: string): Promise<void>;

  /**
   * Add store to user's favorites
   */
  addFavorite(userId: string, storeId: string): Promise<UserFavoriteStore>;

  /**
   * Remove store from user's favorites
   */
  removeFavorite(userId: string, storeId: string): Promise<void>;

  /**
   * Get user's favorite stores
   */
  getFavorites(userId: string): Promise<IStoreWithFavorite[]>;

  /**
   * Reorder user's favorite stores
   */
  reorderFavorites(userId: string, storeIds: string[]): Promise<void>;

  /**
   * Check if store is in user's favorites
   */
  isFavorite(userId: string, storeId: string): Promise<boolean>;

  /**
   * Get stores by chain name
   */
  getByChain(chain: string): Promise<Store[]>;
}
