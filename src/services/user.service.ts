/**
 * User Service Implementation
 *
 * Business logic for user profile management.
 * Handles user CRUD, preferences, and profile updates.
 *
 * @module services/user.service
 */

import type { User, UserPreferences } from '@prisma/client';

import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors/AppError';

import type {
  IUpdatePreferencesInput,
  IUpdateUserInput,
  IUserService,
  IUserStats,
  IUserWithPreferences,
} from './interfaces';

export class UserService implements IUserService {
  readonly serviceName = 'UserService';

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<IUserWithPreferences | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        preferences: true,
      },
    });
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, data: IUpdateUserInput): Promise<User> {
    const user = await this.getById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    data: IUpdatePreferencesInput
  ): Promise<UserPreferences> {
    // Check if preferences exist
    const existing = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (existing) {
      return prisma.userPreferences.update({
        where: { userId },
        data,
      });
    }

    // Create if not exists
    return prisma.userPreferences.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    return prisma.userPreferences.findUnique({
      where: { userId },
    });
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
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<IUserStats> {
    const [listCount, itemCount, collaborationCount, completedListsCount] =
      await Promise.all([
        prisma.shoppingList.count({
          where: { ownerId: userId },
        }),
        prisma.listItem.count({
          where: {
            list: {
              OR: [
                { ownerId: userId },
                { collaborators: { some: { userId } } },
              ],
            },
          },
        }),
        prisma.listCollaborator.count({
          where: { userId },
        }),
        prisma.shoppingList.count({
          where: { ownerId: userId, status: 'COMPLETED' },
        }),
      ]);

    return {
      listCount,
      itemCount,
      collaborationCount,
      completedListsCount,
    };
  }

  /**
   * Search users by email
   */
  async searchByEmail(
    query: string,
    limit = 10
  ): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>> {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: query,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
      take: limit,
    });

    return users;
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
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    return this.updateProfile(userId, { avatarUrl });
  }
}
