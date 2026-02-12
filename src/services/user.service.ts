/**
 * User Service Implementation
 *
 * Business logic for user profile management.
 * Handles user CRUD, preferences, and profile updates.
 *
 * @module services/user.service
 */

import type { User, UserPreferences } from '@prisma/client';

import { NotFoundError } from '@/lib/errors/AppError';
import { UserRepository } from '@/repositories';

import type {
  IUpdatePreferencesInput,
  IUpdateUserInput,
  IUserService,
  IUserStats,
  IUserWithPreferences,
} from './interfaces';

export class UserService implements IUserService {
  readonly serviceName = 'UserService';

  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<IUserWithPreferences | null> {
    const user = await this.userRepo.findByIdWithPreferences(id);
    return user as IUserWithPreferences | null;
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, data: IUpdateUserInput): Promise<User> {
    const user = await this.getById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.userRepo.update(id, data);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    data: IUpdatePreferencesInput
  ): Promise<UserPreferences> {
    // Check if preferences exist via repository
    const existing = await this.userRepo.findPreferences(userId);

    if (existing) {
      // Use repository upsert (handles update case)
      await this.userRepo.updatePreferences(userId, data);
      // Fetch updated preferences
      const updated = await this.userRepo.findPreferences(userId);
      return updated!;
    }

    // Create if not exists via repository upsert
    await this.userRepo.updatePreferences(userId, data);
    const created = await this.userRepo.findPreferences(userId);
    return created!;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    return this.userRepo.findPreferences(userId);
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cascade delete will handle related records
    await this.userRepo.delete(userId);
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<IUserStats> {
    return this.userRepo.getStats(userId);
  }

  /**
   * Search users by email
   */
  async searchByEmail(
    query: string,
    limit = 10
  ): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>> {
    return this.userRepo.searchByEmail(query, limit);
  }

  /**
   * Check if user exists
   */
  async exists(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);
    return !!user;
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    return this.userRepo.update(userId, { emailVerified: true });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    return this.updateProfile(userId, { avatarUrl });
  }
}
