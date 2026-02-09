/**
 * NextAuth API Route Handler
 *
 * Handles all NextAuth authentication routes:
 * - POST /api/auth/signin - Sign in
 * - POST /api/auth/signout - Sign out
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - Get available providers
 *
 * @module app/api/auth/[...nextauth]/route
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
