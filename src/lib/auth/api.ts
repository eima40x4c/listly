/**
 * API Route Protection Utilities
 *
 * Middleware and utilities for protecting API routes with authentication.
 * Provides consistent error responses and user context for API handlers.
 *
 * @module lib/auth/api
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

/**
 * User context passed to authenticated API handlers.
 */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

/**
 * API handler function that receives authenticated user context.
 */
export type AuthenticatedHandler = (
  _request: NextRequest,
  _user: AuthenticatedUser
) => Promise<NextResponse>;

/**
 * Protect an API route - requires authentication.
 * Returns 401 if not authenticated.
 *
 * @param request - NextRequest object
 * @param handler - Handler function to execute if authenticated
 * @returns JSON response from handler or 401 error
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withAuth(request, async (request, user) => {
 *     // user is guaranteed to be authenticated
 *     const lists = await getListsForUser(user.id);
 *     return NextResponse.json({ success: true, data: lists });
 *   });
 * }
 * ```
 */
export async function withAuth(
  request: NextRequest,
  handler: AuthenticatedHandler
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  return handler(request, session.user as AuthenticatedUser);
}

/**
 * Protect an API route - requires verified email.
 * Returns 401 if not authenticated, 403 if email not verified.
 *
 * @param request - NextRequest object
 * @param handler - Handler function to execute if email verified
 * @returns JSON response from handler or error
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withVerifiedEmail(request, async (request, user) => {
 *     // user is authenticated AND email is verified
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */
export async function withVerifiedEmail(
  request: NextRequest,
  handler: AuthenticatedHandler
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  if (!session.user.emailVerified) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Email verification required',
        },
      },
      { status: 403 }
    );
  }

  return handler(request, session.user as AuthenticatedUser);
}

/**
 * Get current user from API route (without requiring auth).
 * Returns null if not authenticated.
 *
 * @returns Promise resolving to user or null
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const user = await getCurrentUserFromRequest();
 *
 *   if (user) {
 *     // Return personalized data
 *   } else {
 *     // Return public data
 *   }
 * }
 * ```
 */
export async function getCurrentUserFromRequest(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  return session?.user ? (session.user as AuthenticatedUser) : null;
}
