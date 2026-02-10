# SOP-501: Integration Testing

## Purpose

Establish integration testing standards to verify that different parts of the system work together correctly. Integration tests catch issues that unit tests miss by testing real interactions between components, databases, and APIs.

---

## Scope

- **Applies to:** API routes, database operations, external service integrations
- **Covers:** Test database setup, API testing, authentication testing
- **Does not cover:** Unit testing (SOP-500), E2E/browser testing, load testing

---

## Prerequisites

- [ ] SOP-500 (Unit Testing) — testing framework configured
- [ ] SOP-101 (Schema Design) — database schema defined
- [ ] SOP-200 (API Design) — API routes implemented

---

## Procedure

### 1. Install Additional Dependencies

```bash
# Supertest for HTTP testing
pnpm add -D supertest @types/supertest

# Test database utilities
pnpm add -D @prisma/client prisma
```

### 2. Configure Test Environment

```bash
# .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_test"
NEXTAUTH_SECRET="test-secret-for-integration-tests"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Create Test Database Utilities

```typescript
// tests/helpers/db.ts

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export async function setupTestDatabase(): Promise<void> {
  // Reset database to clean state
  execSync('pnpm prisma db push --force-reset', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
}

export async function clearDatabase(): Promise<void> {
  // Delete all data in reverse order of dependencies
  const tablenames = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      );
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };
```

### 4. Create Test Factories

```typescript
// tests/factories/user.factory.ts

import { prisma } from '@/tests/helpers/db';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

export interface CreateUserOptions {
  email?: string;
  password?: string;
  name?: string;
  role?: 'USER' | 'ADMIN';
}

export async function createUser(options: CreateUserOptions = {}) {
  const hashedPassword = await bcrypt.hash(
    options.password || 'password123',
    10
  );

  return prisma.user.create({
    data: {
      email: options.email || faker.internet.email(),
      passwordHash: hashedPassword,
      name: options.name || faker.person.fullName(),
      role: options.role || 'USER',
    },
  });
}

export async function createUsers(count: number) {
  return Promise.all(Array.from({ length: count }, () => createUser()));
}
```

```typescript
// tests/factories/index.ts

export * from './user.factory';
export * from './product.factory';
export * from './order.factory';
```

### 5. Create Integration Test Setup

```typescript
// tests/integration/setup.ts

import { beforeAll, afterAll, afterEach } from 'vitest';
import {
  setupTestDatabase,
  clearDatabase,
  disconnectDatabase,
} from '@/tests/helpers/db';

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});
```

### 6. Testing API Routes

```typescript
// tests/integration/api/users.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createUser } from '@/tests/factories';
import { prisma } from '@/tests/helpers/db';

// Import your API handler
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('returns empty array when no users', async () => {
      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });

    it('returns all users', async () => {
      await createUser({ name: 'John Doe', email: 'john@test.com' });
      await createUser({ name: 'Jane Doe', email: 'jane@test.com' });

      const req = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('supports pagination', async () => {
      await Promise.all(Array.from({ length: 25 }, () => createUser()));

      const req = new NextRequest(
        'http://localhost:3000/api/users?page=1&limit=10'
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data).toHaveLength(10);
      expect(data.meta.total).toBe(25);
      expect(data.meta.totalPages).toBe(3);
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@test.com',
          password: 'password123',
          name: 'New User',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.email).toBe('new@test.com');
      expect(data.data.name).toBe('New User');
      expect(data.data.passwordHash).toBeUndefined(); // Should not expose

      // Verify in database
      const user = await prisma.user.findUnique({
        where: { email: 'new@test.com' },
      });
      expect(user).not.toBeNull();
    });

    it('returns 400 for invalid data', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 for duplicate email', async () => {
      await createUser({ email: 'exists@test.com' });

      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'exists@test.com',
          password: 'password123',
          name: 'Duplicate',
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(409);
    });
  });
});
```

### 7. Testing Dynamic Routes

```typescript
// tests/integration/api/users/[id].test.ts

import { describe, it, expect } from 'vitest';
import { createUser } from '@/tests/factories';
import { GET, PUT, DELETE } from '@/app/api/users/[id]/route';
import { NextRequest } from 'next/server';

describe('User by ID API', () => {
  describe('GET /api/users/[id]', () => {
    it('returns user by id', async () => {
      const user = await createUser({ name: 'John' });

      const req = new NextRequest(`http://localhost:3000/api/users/${user.id}`);
      const response = await GET(req, { params: { id: user.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.id).toBe(user.id);
      expect(data.data.name).toBe('John');
    });

    it('returns 404 for non-existent user', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/users/nonexistent'
      );
      const response = await GET(req, { params: { id: 'nonexistent' } });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('updates user', async () => {
      const user = await createUser({ name: 'Old Name' });

      const req = new NextRequest(
        `http://localhost:3000/api/users/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Name' }),
        }
      );

      const response = await PUT(req, { params: { id: user.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('New Name');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('deletes user', async () => {
      const user = await createUser();

      const req = new NextRequest(
        `http://localhost:3000/api/users/${user.id}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(req, { params: { id: user.id } });

      expect(response.status).toBe(204);

      // Verify deletion
      const req2 = new NextRequest(
        `http://localhost:3000/api/users/${user.id}`
      );
      const response2 = await GET(req2, { params: { id: user.id } });
      expect(response2.status).toBe(404);
    });
  });
});
```

### 8. Testing Authentication

```typescript
// tests/integration/auth/login.test.ts

import { describe, it, expect } from 'vitest';
import { createUser } from '@/tests/factories';
import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

describe('Login API', () => {
  it('returns token for valid credentials', async () => {
    await createUser({
      email: 'user@test.com',
      password: 'password123',
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'password123',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
  });

  it('returns 401 for invalid password', async () => {
    await createUser({
      email: 'user@test.com',
      password: 'password123',
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'wrongpassword',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'password123',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});
```

### 9. Testing Protected Routes

```typescript
// tests/integration/api/protected.test.ts

import { describe, it, expect } from 'vitest';
import { createUser } from '@/tests/factories';
import { generateToken } from '@/lib/auth/jwt';
import { GET } from '@/app/api/profile/route';
import { NextRequest } from 'next/server';

describe('Protected Routes', () => {
  it('returns 401 without token', async () => {
    const req = new NextRequest('http://localhost:3000/api/profile');
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const req = new NextRequest('http://localhost:3000/api/profile', {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it('returns profile with valid token', async () => {
    const user = await createUser({ name: 'Test User' });
    const token = generateToken(user);

    const req = new NextRequest('http://localhost:3000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.name).toBe('Test User');
  });
});
```

### 10. Testing Database Transactions

```typescript
// tests/integration/transactions.test.ts

import { describe, it, expect } from 'vitest';
import { prisma } from '@/tests/helpers/db';
import { createUser } from '@/tests/factories';
import { transferFunds } from '@/lib/services/wallet';

describe('Transaction Tests', () => {
  it('transfers funds atomically', async () => {
    const sender = await createUser();
    const receiver = await createUser();

    // Set initial balances
    await prisma.wallet.create({
      data: { userId: sender.id, balance: 100 },
    });
    await prisma.wallet.create({
      data: { userId: receiver.id, balance: 50 },
    });

    await transferFunds(sender.id, receiver.id, 30);

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: sender.id },
    });
    const receiverWallet = await prisma.wallet.findUnique({
      where: { userId: receiver.id },
    });

    expect(senderWallet?.balance).toBe(70);
    expect(receiverWallet?.balance).toBe(80);
  });

  it('rolls back on failure', async () => {
    const sender = await createUser();
    const receiver = await createUser();

    await prisma.wallet.create({
      data: { userId: sender.id, balance: 20 },
    });

    // Attempt transfer exceeding balance
    await expect(transferFunds(sender.id, receiver.id, 50)).rejects.toThrow(
      'Insufficient funds'
    );

    // Verify no changes
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: sender.id },
    });
    expect(senderWallet?.balance).toBe(20);
  });
});
```

### 11. Add Integration Test Script

```json
// package.json
{
  "scripts": {
    "test:integration": "dotenv -e .env.test -- vitest run tests/integration",
    "test:integration:watch": "dotenv -e .env.test -- vitest tests/integration"
  }
}
```

Install dotenv-cli:

```bash
pnpm add -D dotenv-cli
```

---

## Review Checklist

- [ ] Test database configured
- [ ] Database utilities created
- [ ] Test factories for each model
- [ ] API route tests for CRUD operations
- [ ] Authentication tests
- [ ] Protected route tests
- [ ] Transaction tests
- [ ] Test scripts in package.json
- [ ] Tests clean up after themselves

---

## AI Agent Prompt Template

```
Set up integration testing for this project.

Read:
- `prisma/schema.prisma` for models
- `src/app/api/` for routes
- `tests/` for existing test setup

Execute SOP-501 (Integration Testing):
1. Create test database utilities
2. Create factories for each model
3. Set up integration test environment
4. Write tests for API routes
5. Write authentication tests
6. Add integration test script
```

---

## Outputs

- [ ] `.env.test` — Test environment variables
- [ ] `tests/helpers/db.ts` — Database utilities
- [ ] `tests/factories/` — Model factories
- [ ] `tests/integration/setup.ts` — Integration test setup
- [ ] `tests/integration/api/` — API route tests
- [ ] Updated `package.json` with test scripts

---

## Related SOPs

- **SOP-500:** Unit Testing (isolated testing)
- **SOP-200:** API Design (routes to test)
- **SOP-201:** Authentication (auth testing)

---

## Best Practices

| Do                                | Don't                           |
| --------------------------------- | ------------------------------- |
| Use a separate test database      | Share database with development |
| Clean up after each test          | Leave test data behind          |
| Use factories for consistent data | Hardcode test data              |
| Test happy path AND error cases   | Only test success scenarios     |
| Test authentication/authorization | Assume security works           |
