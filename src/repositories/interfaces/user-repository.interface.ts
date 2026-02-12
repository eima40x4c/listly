/**
 * User Repository Interface
 *
 * Data access contract for user operations.
 *
 * @module repositories/interfaces/user-repository.interface
 */

import type { Prisma, User, UserPreferences } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

import type { IBaseRepository } from './base-repository.interface';

/**
 * User with preferences
 */
export type UserWithPreferences = User & {
  preferences: {
    id: string;
    defaultBudgetWarning: Decimal | null;
    defaultCurrency: string;
    notificationsEnabled: boolean;
    locationReminders: boolean;
    theme: string;
  } | null;
};

/**
 * User Repository Interface
 */
export interface IUserRepository extends IBaseRepository<User> {
  /**
   * Create a new user
   */
  create(data: Prisma.UserCreateInput): Promise<User>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by ID with preferences
   */
  findByIdWithPreferences(id: string): Promise<UserWithPreferences | null>;

  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by provider and provider ID
   */
  findByProvider(provider: string, providerId: string): Promise<User | null>;

  /**
   * Update a user
   */
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Find user preferences
   */
  findPreferences(userId: string): Promise<UserPreferences | null>;

  /**
   * Update user preferences (upsert)
   */
  updatePreferences(
    userId: string,
    data: Prisma.UserPreferencesUpdateInput
  ): Promise<void>;

  /**
   * Get user statistics
   */
  getStats(userId: string): Promise<{
    listCount: number;
    itemCount: number;
    collaborationCount: number;
    completedListsCount: number;
  }>;

  /**
   * Search users by email
   */
  searchByEmail(
    query: string,
    limit?: number
  ): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>>;
}
