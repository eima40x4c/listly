/**
 * Prisma Client Instance
 *
 * Singleton pattern to prevent multiple instances in development (hot reloading).
 * This is the recommended approach from Prisma documentation.
 *
 * @module lib/db
 */

import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting database connection limit during hot reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client instance.
 *
 * In development: Uses global object to persist across hot reloads
 * In production: Creates a new instance
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
