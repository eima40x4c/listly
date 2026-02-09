/**
 * Server-Side Session Utilities
 *
 * Provides utilities for accessing and requiring authentication in server components,
 * API routes, and server actions.
 *
 * @module lib/auth/session
 */

import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

import { auth } from '@/lib/auth';

/**
 * Get the current session (if any).
 *
 * @returns Promise resolving to session or null
 *
 * @example
 * ```ts
 * const session = await getSession();
 * if (session) {
 *   console.log('User:', session.user.email);
 * }
 * ```
 */
export async function getSession(): Promise<Session | null> {
  return auth();
}

/**
 * Get the current authenticated user (if any).
 *
 * @returns Promise resolving to user or null
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Logged in as:', user.name);
 * }
 * ```
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication - redirects to login if not authenticated.
 * Use in server components and server actions.
 *
 * @param redirectTo - Optional path to redirect to after login
 * @returns Promise resolving to authenticated user
 * @throws Redirects to /login if not authenticated
 *
 * @example
 * ```ts
 * // In a server component
 * export default async function DashboardPage() {
 *   const user = await requireAuth();
 *
 *   return <div>Welcome, {user.name}</div>;
 * }
 * ```
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const callbackUrl = redirectTo || '/dashboard';
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return user;
}

/**
 * Require email verification - redirects if email not verified.
 *
 * @returns Promise resolving to verified user
 * @throws Redirects to /auth/verify if email not verified
 *
 * @example
 * ```ts
 * export default async function ProtectedPage() {
 *   const user = await requireVerifiedEmail();
 *   // User is authenticated AND email is verified
 * }
 * ```
 */
export async function requireVerifiedEmail() {
  const user = await requireAuth();

  if (!user.emailVerified) {
    redirect('/auth/verify');
  }

  return user;
}

/**
 * Check if user is authenticated (without redirecting).
 * Useful for conditional rendering in server components.
 *
 * @returns Promise resolving to boolean
 *
 * @example
 * ```ts
 * export default async function HomePage() {
 *   const isAuthenticated = await isAuth();
 *
 *   return isAuthenticated ? <Dashboard /> : <Landing />;
 * }
 * ```
 */
export async function isAuth(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
