/**
 * User Registration API Endpoint
 *
 * POST /api/auth/register
 *
 * Creates a new user account with email and password.
 * Validates input, checks for existing users, and hashes passwords securely.
 *
 * Uses withErrorHandling for consistent error responses, request IDs, and logging.
 * Uses shared registerSchema from validation layer for single source of truth.
 *
 * @module app/api/auth/register/route
 */

import { NextResponse } from 'next/server';

import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';
import { ConflictError } from '@/lib/errors/AppError';
import { registerSchema } from '@/lib/validation/schemas/user';

/**
 * POST handler for user registration.
 *
 * @param request - NextRequest object
 * @returns JSON response with created user or error
 *
 * @example
 * Request body:
 * ```json
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",
 *   "name": "John Doe"
 * }
 * ```
 *
 * Success response (201):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "id": "clx123...",
 *     "email": "user@example.com",
 *     "name": "John Doe",
 *     "createdAt": "2026-02-09T12:00:00Z"
 *   }
 * }
 * ```
 *
 * Error responses:
 * - 400: Validation error (handled automatically by withErrorHandling via ZodError)
 * - 409: Email already exists
 * - 500: Server error (handled automatically by withErrorHandling)
 */
export const POST = withErrorHandling(async (request) => {
  // Parse and validate request body using shared schema
  const body = await request.json();
  const { email, password, name } = registerSchema.parse(body);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with default preferences
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      provider: 'EMAIL',
      preferences: {
        create: {
          defaultCurrency: 'USD',
          notificationsEnabled: true,
          locationReminders: false,
          theme: 'system',
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: user,
    },
    { status: 201 }
  );
});
