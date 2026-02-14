/**
 * Client-Side Authentication Hook
 *
 * Provides authentication state and methods for client components.
 * Supports OAuth (Google, Apple) as primary and credentials as fallback.
 *
 * @module hooks/useAuth
 */

'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback } from 'react';

/**
 * Authentication hook for client components.
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * export function LoginPage() {
 *   const { isLoading, isAuthenticated, signInWithGoogle, signInWithApple, signInWithCredentials } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (isAuthenticated) redirect('/lists');
 *
 *   return (
 *     <div>
 *       <button onClick={() => signInWithGoogle()}>Continue with Google</button>
 *       <button onClick={() => signInWithApple()}>Continue with Apple</button>
 *       <hr />
 *       <form onSubmit={handleCredentials}>...</form>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const { data: session, status, update } = useSession();

  /** Sign in with Google (primary) */
  const signInWithGoogle = useCallback(async (callbackUrl?: string) => {
    await signIn('google', {
      callbackUrl: callbackUrl || '/lists',
    });
  }, []);

  /** Sign in with Apple (primary) */
  const signInWithApple = useCallback(async (callbackUrl?: string) => {
    await signIn('apple', {
      callbackUrl: callbackUrl || '/lists',
    });
  }, []);

  /** Sign in with email/password (fallback) */
  const signInWithCredentials = useCallback(
    async (email: string, password: string, callbackUrl?: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl || '/lists',
      });
      return result;
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    await signOut({
      callbackUrl: '/login',
    });
  }, []);

  return {
    /** Current user object (null if not authenticated) */
    user: session?.user ?? null,

    /** Full session object */
    session,

    /** Loading state */
    isLoading: status === 'loading',

    /** Whether user is authenticated */
    isAuthenticated: status === 'authenticated',

    /** Whether user is unauthenticated */
    isUnauthenticated: status === 'unauthenticated',

    /** Whether user's email is verified (if available) */
    isEmailVerified: session?.user?.emailVerified ? true : false,

    /** Sign in with Google (primary) */
    signInWithGoogle,

    /** Sign in with Apple (primary) */
    signInWithApple,

    /** Sign in with email/password (fallback) */
    signInWithCredentials,

    /** Sign out with redirect */
    signOut: handleSignOut,

    /** Update session (refresh user data) */
    updateSession: update,

    /** Session status */
    status,
  };
}
