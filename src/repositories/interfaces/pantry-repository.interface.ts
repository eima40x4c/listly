/**
 * Pantry Repository Interface
 *
 * Data access layer interface for pantry/inventory operations.
 *
 * @module repositories/interfaces/pantry-repository.interface
 */

import type { PantryItem, Prisma } from '@prisma/client';

import type {
  IBaseRepository,
  QueryOptions,
} from './base-repository.interface';

/**
 * Filter options for pantry queries
 */
export interface PantryQueryOptions extends QueryOptions {
  categoryId?: string;
  location?: string;
  isConsumed?: boolean;
  expiringBefore?: Date;
  barcode?: string;
  search?: string;
}

/**
 * Extended Pantry Item with related data
 */
export type PantryItemWithDetails = PantryItem & {
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
};

export interface IPantryRepository extends IBaseRepository<PantryItem> {
  create(data: Prisma.PantryItemCreateInput): Promise<PantryItem>;
  findById(id: string): Promise<PantryItem | null>;
  findByIdWithDetails(id: string): Promise<PantryItemWithDetails | null>;
  update(id: string, data: Prisma.PantryItemUpdateInput): Promise<PantryItem>;
  delete(id: string): Promise<void>;

  findByUser(
    userId: string,
    options?: PantryQueryOptions
  ): Promise<PantryItemWithDetails[]>;
  countByUser(userId: string, options?: PantryQueryOptions): Promise<number>;

  findExpiringSoon(
    userId: string,
    daysThreshold: number
  ): Promise<PantryItemWithDetails[]>;

  isOwner(itemId: string, userId: string): Promise<boolean>;
}
