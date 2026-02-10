# SOP-201: Authentication

## Purpose

Implement secure user authentication to verify identity before granting access to protected resources. This SOP covers session-based and token-based authentication patterns.

---

## Scope

- **Applies to:** All applications requiring user login
- **Covers:** Authentication strategies, session management, password handling
- **Does not cover:** Authorization/permissions (SOP-202), OAuth providers

---

## Prerequisites

- [ ] SOP-101 (Schema Design) completed — User model exists
- [ ] SOP-200 (API Design) completed — Auth endpoints defined
- [ ] Password hashing library selected

---

## Procedure

### 1. Choose Authentication Strategy

| Strategy             | Best For             | Considerations               |
| -------------------- | -------------------- | ---------------------------- |
| **Session-based**    | Traditional web apps | Requires session storage     |
| **JWT**              | APIs, SPAs, mobile   | Token management, expiration |
| **NextAuth/Auth.js** | Next.js apps         | Built-in providers, sessions |

**Recommendation:** Use NextAuth.js for Next.js apps; JWT for pure APIs.

### 2. Install Dependencies

**Next.js with NextAuth:**

```bash
pnpm add next-auth @auth/prisma-adapter bcryptjs
pnpm add -D @types/bcryptjs
```

**Express with JWT:**

```bash
pnpm add jsonwebtoken bcryptjs
pnpm add -D @types/jsonwebtoken @types/bcryptjs
```

### 3. Password Security

**Never store plain text passwords.** Always hash with bcrypt.

```typescript
// src/lib/auth/password.ts

import { hash, compare } from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- (Optional) At least one special character

```typescript
// src/lib/auth/validation.ts

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
```

### 4. NextAuth.js Setup (Recommended for Next.js)

**Create auth configuration:**

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
```

**Create API route:**

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Extend types:**

```typescript
// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}
```

### 5. Registration Endpoint

```typescript
// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  name: z.string().min(1, 'Name is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### 6. Protected Route Utility

```typescript
// src/lib/auth/session.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
  return user;
}
```

**Usage in Server Components:**

```typescript
// src/app/dashboard/page.tsx

import { requireAuth } from '@/lib/auth/session';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

### 7. API Route Protection

```typescript
// src/lib/auth/api.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function withAuth(
  request: NextRequest,
  handler: (user: { id: string; role: string }) => Promise<NextResponse>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return handler(session.user);
}

export async function withAdmin(
  request: NextRequest,
  handler: (user: { id: string; role: string }) => Promise<NextResponse>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Admin access required' },
      { status: 403 }
    );
  }

  return handler(session.user);
}
```

### 8. Client-Side Session Hook

```typescript
// src/hooks/useAuth.ts

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signIn,
    signOut,
  };
}
```

### 9. Environment Variables

Add to `.env`:

```bash
# NextAuth
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

---

## Review Checklist

- [ ] Authentication strategy chosen
- [ ] Password hashing implemented (bcrypt, 12+ rounds)
- [ ] Password validation rules enforced
- [ ] Session/token configuration set
- [ ] Registration endpoint created
- [ ] Login functionality working
- [ ] Protected route utilities created
- [ ] NEXTAUTH_SECRET is secure and not committed
- [ ] Session expiration configured

---

## AI Agent Prompt Template

```
Implement authentication for this project.

Read:
- `/docs/tech-stack.md` for framework
- `prisma/schema.prisma` for User model

Execute SOP-201 (Authentication):
1. Install authentication dependencies
2. Create password hashing utilities
3. Configure NextAuth with Prisma adapter
4. Create registration endpoint
5. Create protected route utilities
6. Add session hooks for client
7. Update environment variables
```

---

## Outputs

- [ ] `src/lib/auth.ts` — Auth configuration
- [ ] `src/lib/auth/password.ts` — Password utilities
- [ ] `src/lib/auth/session.ts` — Session utilities
- [ ] `src/app/api/auth/[...nextauth]/route.ts` — Auth API route
- [ ] `src/app/api/auth/register/route.ts` — Registration endpoint
- [ ] Updated `.env.example` with auth variables

---

## Related SOPs

- **SOP-101:** Schema Design (User model)
- **SOP-202:** Authorization (permissions after auth)
- **SOP-203:** Error Handling (auth errors)

---

## Security Reminders

| Do                                      | Don't                        |
| --------------------------------------- | ---------------------------- |
| Hash passwords with bcrypt (12+ rounds) | Store plain text passwords   |
| Use secure session secrets              | Use weak/predictable secrets |
| Set appropriate session expiration      | Use infinite sessions        |
| Validate password strength              | Allow weak passwords         |
| Use HTTPS in production                 | Send credentials over HTTP   |
| Rate limit login attempts               | Allow unlimited attempts     |
