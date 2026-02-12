/**
 * List Repository Interface
 *
 * Data access contract for shopping list operations.
 *
 * @module repositories/interfaces/list-repository.interface
 */

import type { Prisma, ShoppingList } from '@prisma/client';
/**
 * Shopping list with full item details
 */
import type { Decimal } from '@prisma/client/runtime/library';

import type {
  IBaseRepository,
  QueryOptions,
} from './base-repository.interface';

export type ListWithItems = ShoppingList & {
  items: Array<{
    id: string;
    name: string;
    quantity: Decimal;
    unit: string | null;
    isChecked: boolean;
    categoryId: string | null;
    estimatedPrice: Decimal | null;
    sortOrder: number;
  }>;
  collaborators: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  store: {
    id: string;
    name: string;
    chain: string | null;
  } | null;
};

/**
 * List Repository Interface
 */
export interface IListRepository extends IBaseRepository<ShoppingList> {
  /**
   * Create a new shopping list
   */
  create(data: Prisma.ShoppingListCreateInput): Promise<ShoppingList>;

  /**
   * Find a list by ID
   */
  findById(id: string): Promise<ShoppingList | null>;

  /**
   * Find a list by ID with all related data
   */
  findByIdWithDetails(id: string): Promise<ListWithItems | null>;

  /**
   * Update a shopping list
   */
  update(
    id: string,
    data: Prisma.ShoppingListUpdateInput
  ): Promise<ShoppingList>;

  /**
   * Delete a shopping list
   */
  delete(id: string): Promise<void>;

  /**
   * Find lists owned by a user
   */
  findByOwner(ownerId: string, options?: QueryOptions): Promise<ShoppingList[]>;

  /**
   * Find lists shared with a user
   */
  findSharedWithUser(userId: string): Promise<ShoppingList[]>;

  /**
   * Count lists owned by a user
   */
  countByOwner(ownerId: string): Promise<number>;

  /**
   * Check if user has access to a list (owner or collaborator)
   */
  hasAccess(listId: string, userId: string): Promise<boolean>;

  /**
   * Check if user is the owner of a list
   */
  isOwner(listId: string, userId: string): Promise<boolean>;

  /**
   * Count collaborators on a list
   */
  countCollaborators(listId: string): Promise<number>;

  /**
   * Get item count for a list
   */
  getItemCount(listId: string): Promise<number>;

  /**
   * Get checked item count for a list
   */
  getCheckedItemCount(listId: string): Promise<number>;

  /**
   * Get estimated total for a list
   */
  getEstimatedTotal(listId: string): Promise<number>;

  /**
   * Find accessible lists with filter, pagination, and sorting
   */
  findAccessible(
    where: Prisma.ShoppingListWhereInput,
    options: { skip: number; take: number; orderBy?: Record<string, string> }
  ): Promise<{ lists: ShoppingList[]; total: number }>;

  /**
   * Find template lists owned by a user
   */
  findTemplates(ownerId: string): Promise<ShoppingList[]>;

  /**
   * Find a template list by ID
   */
  findTemplate(id: string): Promise<ShoppingList | null>;

  /**
   * Find a list with owner info
   */
  findByIdWithOwner(
    id: string
  ): Promise<(ShoppingList & { owner: { id: string; name: string } }) | null>;
}
