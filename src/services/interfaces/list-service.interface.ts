/**
 * List Service Interface
 *
 * Defines the contract for shopping list business logic.
 * Handles list CRUD, budget tracking, and list management operations.
 *
 * @module services/interfaces/list-service.interface
 */

import type { ListStatus, ShoppingList } from '@prisma/client';

import type {
  IPaginatedResponse,
  IPaginationOptions,
} from './base-service.interface';

/**
 * Input for creating a new shopping list
 */
export interface ICreateListInput {
  name: string;
  description?: string;
  budget?: number;
  color?: string;
  icon?: string;
  ownerId: string;
  storeId?: string;
  isTemplate?: boolean;
}

/**
 * Input for updating a shopping list
 */
export interface IUpdateListInput {
  name?: string;
  description?: string;
  budget?: number;
  color?: string;
  icon?: string;
  storeId?: string;
  status?: ListStatus;
}

/**
 * Filter options for listing shopping lists
 */
export interface IListFilters extends IPaginationOptions {
  status?: ListStatus;
  storeId?: string;
  isTemplate?: boolean;
  search?: string;
}

/**
 * Shopping list with item count and budget info
 */
export interface IListWithMeta extends ShoppingList {
  itemCount: number;
  checkedCount: number;
  estimatedTotal: number;
  collaboratorCount: number;
}

/**
 * Shopping List Service Interface
 */
export interface IListService {
  /**
   * Create a new shopping list
   */
  create(userId: string, data: ICreateListInput): Promise<ShoppingList>;

  /**
   * Get a shopping list by ID
   */
  getById(id: string, userId: string): Promise<ShoppingList | null>;

  /**
   * Update a shopping list
   */
  update(
    id: string,
    userId: string,
    data: IUpdateListInput
  ): Promise<ShoppingList>;

  /**
   * Delete a shopping list
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Get lists for a user with filters and pagination
   */
  getByUser(
    userId: string,
    filters?: IListFilters
  ): Promise<IPaginatedResponse<IListWithMeta>>;

  /**
   * Get a single list with full details (items, collaborators)
   */
  getByIdWithDetails(id: string, userId: string): Promise<IListWithMeta | null>;

  /**
   * Set or update budget for a list
   */
  setBudget(id: string, userId: string, budget: number): Promise<ShoppingList>;

  /**
   * Mark list as completed
   */
  complete(id: string, userId: string): Promise<ShoppingList>;

  /**
   * Archive a list
   */
  archive(id: string, userId: string): Promise<ShoppingList>;

  /**
   * Duplicate a list (copy all items)
   */
  duplicate(id: string, userId: string, newName: string): Promise<ShoppingList>;

  /**
   * Create list from template
   */
  createFromTemplate(
    templateId: string,
    userId: string,
    name?: string
  ): Promise<ShoppingList>;

  /**
   * Get user's list templates
   */
  getTemplates(userId: string): Promise<ShoppingList[]>;

  /**
   * Check if user has access to list
   */
  hasAccess(listId: string, userId: string): Promise<boolean>;

  /**
   * Get list ownership info
   */
  getOwner(listId: string): Promise<{ ownerId: string; ownerName: string }>;
}
