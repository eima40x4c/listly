/**
 * User Registration API Endpoint
 *
 * POST /api/auth/register
 *
 * Creates a new user account with email and password.
 * Validates input, checks for existing users, and hashes passwords securely.
 *
 * @module app/api/auth/register/route
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';

/**
 * Registration request validation schema.
 *
 * Requirements:
 * - Valid email format
 * - Password min 8 chars with uppercase, lowercase, and number
 * - Name required (1-100 chars)
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
});

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
 * - 400: Validation error
 * - 409: Email already exists
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { email, password, name } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
          },
        },
        { status: 409 }
      );
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
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Log unexpected errors
    console.error('Registration error:', error);

    // Return generic error to client
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred during registration. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
