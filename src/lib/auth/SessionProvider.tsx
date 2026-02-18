/**
 * Session Provider Component
 *
 * Client component that wraps the app with NextAuth SessionProvider.
 * This enables client-side session access via useSession hook.
 *
 * @module lib/auth/SessionProvider
 */

'use client';

import type { Session } from 'next-auth';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Session provider wrapper for NextAuth.
 * Use this in the root layout to provide session context to all client components.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { SessionProvider } from '@/lib/auth/SessionProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </NextAuthSessionProvider>
  );
}
