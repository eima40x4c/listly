# Authentication Implementation

> **Status:** ✅ Implemented (SOP-201)  
> **Last Updated:** 2026-02-09  
> **Framework:** NextAuth.js v5

---

## Overview

Listly uses [NextAuth.js v5](https://next-auth.js.org/) for authentication with a JWT session strategy. This provides:

- ✅ Email/password authentication
- ✅ Stateless JWT sessions (no server-side session storage)
- ✅ Secure password hashing (bcrypt, 12 rounds)
- ✅ Session expiration and refresh (30 days, refresh every 24h)
- ✅ Type-safe session access (TypeScript)
- ✅ Protected routes and API endpoints
- 🔜 OAuth providers (Google, GitHub, Apple) - ready for extension

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Authentication Flow                     │
└─────────────────────────────────────────────────────────────┘

Registration:
┌──────────┐      ┌──────────────┐      ┌──────────┐
│  Client  │─────▶│ /api/auth/   │─────▶│ Database │
│          │      │   register   │      │ (Prisma) │
└──────────┘      └──────────────┘      └──────────┘
                         │
                         ├─ Validate input (Zod)
                         ├─ Check email exists
                         ├─ Hash password (bcrypt)
                         └─ Create user + preferences

Login (NextAuth):
┌──────────┐      ┌──────────────┐      ┌──────────┐
│  Client  │─────▶│ /api/auth/   │─────▶│ Database │
│          │      │   signin     │      │ (Prisma) │
└──────────┘      └──────────────┘      └──────────┘
                         │
                         ├─ Find user by email
                         ├─ Verify password
                         ├─ Generate JWT
                         └─ Set session cookie

Session Access:
Server Component:
  → getServerSession() → JWT from cookie → User

Client Component:
  → useSession() → Session from context → User

API Route:
  → withAuth() → JWT verification → Handler(user)
```

---

## Files Structure

```
src/
├── lib/
│   ├── db.ts                           # Prisma client singleton
│   ├── auth.ts                         # NextAuth configuration
│   └── auth/
│       ├── password.ts                 # Password hashing/verification
│       ├── validation.ts               # Validation rules
│       ├── session.ts                  # Server session utilities
│       ├── api.ts                      # API route protection
│       └── SessionProvider.tsx         # Client provider
├── app/api/auth/
│   ├── [...nextauth]/route.ts         # NextAuth handler
│   └── register/route.ts               # Registration endpoint
├── hooks/
│   └── useAuth.ts                      # Client auth hook
└── types/
    └── next-auth.d.ts                  # Type extensions
```

---

## Usage Examples

### 1. Registration

**Client-side:**

```tsx
'use client';

async function handleRegister(data: {
  email: string;
  password: string;
  name: string;
}) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const result = await response.json();
  return result.data; // { id, email, name, createdAt }
}
```

### 2. Login

**Client-side (using NextAuth):**

```tsx
'use client';

import { signIn } from 'next-auth/react';

async function handleLogin(email: string, password: string) {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    throw new Error(result.error);
  }

  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

### 3. Protected Server Component

```tsx
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/session';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### 4. Protected API Route

```tsx
// app/api/lists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    // user is guaranteed to be authenticated
    const lists = await prisma.shoppingList.findMany({
      where: { ownerId: user.id },
    });

    return NextResponse.json({ success: true, data: lists });
  });
}
```

### 5. Client Component with Auth

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export function ProfileButton() {
  const { user, isLoading, isAuthenticated, signIn, signOut } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### 6. Optional Auth (Public/Private Data)

```tsx
// app/api/public/route.ts
import { getCurrentUserFromRequest } from '@/lib/auth/api';

export async function GET() {
  const user = await getCurrentUserFromRequest();

  if (user) {
    // Return personalized data
    return NextResponse.json({ data: getPersonalizedData(user.id) });
  } else {
    // Return public data
    return NextResponse.json({ data: getPublicData() });
  }
}
```

---

## Security Features

### Password Requirements

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ℹ️ Special characters allowed but not required

**Validation regex:**

```typescript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
```

### Password Hashing

- **Algorithm:** bcrypt
- **Salt rounds:** 12
- **Storage:** `passwordHash` field in database (nullable for OAuth users)

### Session Security

- **Strategy:** JWT (stateless)
- **Max age:** 30 days
- **Update age:** 24 hours (session refreshes every day)
- **Secret:** `NEXTAUTH_SECRET` environment variable (must be 32+ random chars)
- **Cookie:** HTTP-only, Secure (in production), SameSite=Lax

---

## API Endpoints

### POST /api/auth/register

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Success (201):**

```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2026-02-09T12:00:00Z"
  }
}
```

**Errors:**

- `400` - Validation error
- `409` - Email already exists
- `500` - Server error

### POST /api/auth/signin

Login with credentials (handled by NextAuth).

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### GET /api/auth/session

Get current session (handled by NextAuth).

**Response:**

```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "expires": "2026-03-11T12:00:00Z"
}
```

### POST /api/auth/signout

Sign out current user (handled by NextAuth).

---

## Environment Variables

**Required:**

```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here

# Application URL (must match actual URL)
NEXTAUTH_URL=http://localhost:3000
```

**Optional (OAuth):**

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

---

## Type Definitions

### Extended Session Type

```typescript
// User object in session
interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: boolean;
  };
  expires: string;
}
```

### Authenticated User (API Context)

```typescript
interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
}
```

---

## Testing

### Manual Testing

1. **Registration:**

   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123","name":"Test User"}'
   ```

2. **Login:**
   - Navigate to `/login`
   - Enter email and password
   - Check session cookie in DevTools

3. **Protected Route:**
   - Navigate to `/dashboard` (should redirect if not logged in)
   - Login and retry (should show dashboard)

4. **API Protection:**

   ```bash
   # Without auth (should return 401)
   curl http://localhost:3000/api/lists

   # With auth (get session token from cookie)
   curl http://localhost:3000/api/lists \
     -H "Cookie: next-auth.session-token=YOUR_TOKEN"
   ```

---

## Future Enhancements

- [ ] OAuth providers (Google, GitHub, Apple)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] Session revocation
- [ ] Login audit log
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts

---

## Troubleshooting

### "NEXTAUTH_SECRET not set"

Ensure `.env` contains:

```bash
NEXTAUTH_SECRET=your-secret-key-here
```

Generate a new secret:

```bash
openssl rand -base64 32
```

### Session not persisting

1. Check `NEXTAUTH_URL` matches your actual URL
2. Ensure cookies are enabled in browser
3. Check for CORS issues (if API is on different domain)

### "Invalid email or password"

1. Verify email is lowercase (normalized in registration)
2. Check password meets requirements
3. Ensure user exists in database
4. Check `isActive` field is true

### Type errors with session

Make sure `src/types/next-auth.d.ts` is included in `tsconfig.json`:

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

---

## Related Documentation

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Environment Variables](./environment-variables.md)
- [API Endpoints](./api/endpoints.md)
- [Database Schema](./database/schema.md)
