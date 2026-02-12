/**
 * User Repository Implementation
 *
 * Data access layer for user operations.
 * Encapsulates all Prisma queries for users.
 *
 * @module repositories/user.repository
 */

import type {
  AuthProvider,
  Prisma,
  PrismaClient,
  User,
  UserPreferences,
} from '@prisma/client';

import { BaseRepository } from './base.repository';
import type { IUserRepository, UserWithPreferences } from './interfaces';

export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor(client?: PrismaClient | Prisma.TransactionClient) {
    super(client);
  }

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return (this.db as PrismaClient).user.create({ data });
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return (this.db as PrismaClient).user.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by ID with preferences
   */
  async findByIdWithPreferences(
    id: string
  ): Promise<UserWithPreferences | null> {
    return (this.db as PrismaClient).user.findUnique({
      where: { id },
      include: {
        preferences: true,
      },
    });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return (this.db as PrismaClient).user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by provider and provider ID
   */
  async findByProvider(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    return (this.db as PrismaClient).user.findFirst({
      where: {
        provider: provider as AuthProvider,
        providerId,
      },
    });
  }

  /**
   * Update a user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return (this.db as PrismaClient).user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    await (this.db as PrismaClient).user.delete({
      where: { id },
    });
  }

  /**
   * Find user preferences
   */
  async findPreferences(userId: string): Promise<UserPreferences | null> {
    return (this.db as PrismaClient).userPreferences.findUnique({
      where: { userId },
    });
  }

  /**
   * Update user preferences (upsert)
   */
  async updatePreferences(
    userId: string,
    data: Prisma.UserPreferencesUpdateInput
  ): Promise<void> {
    await (this.db as PrismaClient).userPreferences.upsert({
      where: { userId },
      update: data,
      create: {
        user: { connect: { id: userId } },
        ...(data as Omit<Prisma.UserPreferencesCreateInput, 'user'>),
      },
    });
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<{
    listCount: number;
    itemCount: number;
    collaborationCount: number;
    completedListsCount: number;
  }> {
    const [listCount, itemCount, collaborationCount, completedListsCount] =
      await Promise.all([
        (this.db as PrismaClient).shoppingList.count({
          where: { ownerId: userId },
        }),
        (this.db as PrismaClient).listItem.count({
          where: {
            list: {
              OR: [
                { ownerId: userId },
                { collaborators: { some: { userId } } },
              ],
            },
          },
        }),
        (this.db as PrismaClient).listCollaborator.count({
          where: { userId },
        }),
        (this.db as PrismaClient).shoppingList.count({
          where: { ownerId: userId, status: 'COMPLETED' },
        }),
      ]);

    return { listCount, itemCount, collaborationCount, completedListsCount };
  }

  /**
   * Search users by email
   */
  async searchByEmail(
    query: string,
    limit = 10
  ): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>> {
    return (this.db as PrismaClient).user.findMany({
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
  }
}
