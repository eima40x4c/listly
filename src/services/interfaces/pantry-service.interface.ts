/**
 * Pantry Service Interface
 *
 * Business logic layer interface for pantry/inventory operations.
 *
 * @module services/interfaces/pantry-service.interface
 */

import type { PantryItem } from '@prisma/client';

import type {
  BulkConsumePantryItemsInput,
  CreatePantryItemInput,
  PantryItemQuery,
  UpdatePantryItemInput,
} from '@/lib/validation/schemas/pantry-item';
import type { PantryItemWithDetails } from '@/repositories/interfaces/pantry-repository.interface';

import type {
  IBaseService,
  IPaginatedResponse,
} from './base-service.interface';

export interface IPantryService extends IBaseService {
  create(userId: string, input: CreatePantryItemInput): Promise<PantryItem>;
  getById(id: string, userId: string): Promise<PantryItem | null>;
  getByIdWithDetails(
    id: string,
    userId: string
  ): Promise<PantryItemWithDetails | null>;
  update(
    id: string,
    userId: string,
    input: UpdatePantryItemInput
  ): Promise<PantryItem>;
  delete(id: string, userId: string): Promise<void>;

  getByUser(
    userId: string,
    filters?: PantryItemQuery
  ): Promise<IPaginatedResponse<PantryItemWithDetails>>;

  consume(id: string, userId: string): Promise<PantryItem>;
  bulkConsume(
    userId: string,
    input: BulkConsumePantryItemsInput
  ): Promise<void>;

  getExpiringSoon(
    userId: string,
    daysThreshold: number
  ): Promise<PantryItemWithDetails[]>;
}
