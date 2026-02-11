/**
 * User Service Interface
 *
 * Defines the contract for user profile management.
 * Handles user CRUD, preferences, and profile updates.
 *
 * @module services/interfaces/user-service.interface
 */

import type { User, UserPreferences } from '@prisma/client';

import type { IBaseService } from './base-service.interface';

/**
 * Input for updating user profile
 */
export interface IUpdateUserInput {
  name?: string;
  avatarUrl?: string;
}

/**
 * Input for updating user preferences
 */
export interface IUpdatePreferencesInput {
  defaultBudgetWarning?: number;
  defaultCurrency?: string;
  notificationsEnabled?: boolean;
  locationReminders?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * User with preferences
 */
export interface IUserWithPreferences extends User {
  preferences: UserPreferences | null;
}

/**
 * User statistics
 */
export interface IUserStats {
  listCount: number;
  itemCount: number;
  collaborationCount: number;
  completedListsCount: number;
  totalSpent?: number;
}

/**
 * User Service Interface
 */
export interface IUserService extends IBaseService {
  /**
   * Get user by ID
   */
  getById(id: string): Promise<IUserWithPreferences | null>;

  /**
   * Get user by email
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * Update user profile
   */
  updateProfile(id: string, data: IUpdateUserInput): Promise<User>;

  /**
   * Update user preferences
   */
  updatePreferences(
    userId: string,
    data: IUpdatePreferencesInput
  ): Promise<UserPreferences>;

  /**
   * Get user preferences
   */
  getPreferences(userId: string): Promise<UserPreferences | null>;

  /**
   * Delete user account
   */
  deleteAccount(userId: string): Promise<void>;

  /**
   * Get user statistics
   */
  getStats(userId: string): Promise<IUserStats>;

  /**
   * Search users by email (for sharing)
   */
  searchByEmail(
    query: string,
    limit?: number
  ): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>>;

  /**
   * Check if user exists by email
   */
  exists(email: string): Promise<boolean>;

  /**
   * Verify user email
   */
  verifyEmail(userId: string): Promise<User>;

  /**
   * Update user avatar
   */
  updateAvatar(userId: string, avatarUrl: string): Promise<User>;
}
