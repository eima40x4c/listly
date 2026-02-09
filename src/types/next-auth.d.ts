/**
 * NextAuth Type Extensions
 *
 * Extends NextAuth types to include custom user properties.
 * This provides full type safety for session and JWT data.
 *
 * @module types/next-auth
 */

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session.user type.
   */
  interface Session {
    user: {
      /** User's unique ID from database */
      id: string;
    } & DefaultSession['user'];
  }

  /**
   * Extends the built-in user type returned from authorize().
   */
  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: Date | null;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the default JWT token type.
   */
  interface JWT {
    /** User's unique ID from database */
    id: string;
    /** Whether the user's email has been verified */
    emailVerified: boolean;
  }
}
