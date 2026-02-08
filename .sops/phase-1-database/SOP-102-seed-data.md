# SOP-102: Seed Data

## Purpose

Create realistic, consistent seed data for local development and testing. Good seed data accelerates development by providing data to work with immediately and ensures consistent behavior across team environments.

---

## Scope

- **Applies to:** All projects with databases
- **Covers:** Development seed data, test fixtures, data generation
- **Does not cover:** Production data migration, backup/restore

---

## Prerequisites

- [ ] SOP-101 (Schema Design) completed
- [ ] Database migrations applied
- [ ] Prisma schema finalized

---

## Procedure

### 1. Identify Seed Data Needs

| Data Type | Purpose | Examples |
|-----------|---------|----------|
| **Reference data** | Static lookup values | Categories, countries, roles |
| **Test users** | Development accounts | Admin user, test customer |
| **Sample content** | Realistic examples | Products, posts, orders |
| **Edge cases** | Testing boundaries | Empty states, max values |

### 2. Create Seed Script Structure

Create `prisma/seed.ts`:

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (development only)
  await clearDatabase();

  // Seed in order of dependencies
  await seedUsers();
  await seedCategories();
  await seedProducts();
  await seedOrders();

  console.log('✅ Seed completed!');
}

async function clearDatabase() {
  // Delete in reverse order of dependencies
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 3. Seed Reference Data

```typescript
// prisma/seed.ts (continued)

async function seedCategories() {
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Books', slug: 'books' },
    { name: 'Sports', slug: 'sports' },
  ];

  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  console.log(`📁 Created ${categories.length} categories`);
}
```

### 4. Seed Test Users

```typescript
// prisma/seed.ts (continued)

async function seedUsers() {
  // Default password for all seed users: "password123"
  const passwordHash = await hash('password123', 12);

  const users = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN' as const,
    },
    {
      email: 'user@example.com',
      name: 'Test User',
      passwordHash,
      role: 'USER' as const,
    },
    {
      email: 'demo@example.com',
      name: 'Demo Account',
      passwordHash,
      role: 'USER' as const,
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log(`👤 Created ${users.length} users`);
}
```

### 5. Seed Sample Content

```typescript
// prisma/seed.ts (continued)

async function seedProducts() {
  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.slug, c.id])
  );

  const products = [
    // Electronics
    {
      name: 'Wireless Headphones',
      description: 'High-quality Bluetooth headphones with noise cancellation',
      price: 149.99,
      stock: 50,
      categoryId: categoryMap['electronics'],
      imageUrl: 'https://picsum.photos/seed/headphones/400/400',
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor',
      price: 299.99,
      stock: 30,
      categoryId: categoryMap['electronics'],
      imageUrl: 'https://picsum.photos/seed/watch/400/400',
    },
    // Clothing
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt',
      price: 24.99,
      stock: 100,
      categoryId: categoryMap['clothing'],
      imageUrl: 'https://picsum.photos/seed/tshirt/400/400',
    },
    // Add more products...
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`📦 Created ${products.length} products`);
}

async function seedOrders() {
  const testUser = await prisma.user.findUnique({
    where: { email: 'user@example.com' },
  });

  const products = await prisma.product.findMany({ take: 3 });

  if (!testUser || products.length === 0) return;

  // Create a sample order
  await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'DELIVERED',
      total: 199.97,
      items: {
        create: products.slice(0, 2).map((product) => ({
          productId: product.id,
          quantity: 1,
          priceAtTime: product.price,
        })),
      },
    },
  });

  // Create a pending order
  await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'PENDING',
      total: 149.99,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            priceAtTime: products[0].price,
          },
        ],
      },
    },
  });

  console.log('🛒 Created sample orders');
}
```

### 6. Use Faker for Realistic Data

For larger datasets, use Faker:

```bash
pnpm add -D @faker-js/faker
```

```typescript
// prisma/seed.ts

import { faker } from '@faker-js/faker';

async function seedManyProducts(count: number = 50) {
  const categories = await prisma.category.findMany();
  
  const products = Array.from({ length: count }, () => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    categoryId: faker.helpers.arrayElement(categories).id,
    imageUrl: faker.image.url({ width: 400, height: 400 }),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
  }));

  await prisma.product.createMany({ data: products });

  console.log(`📦 Created ${count} random products`);
}

async function seedManyUsers(count: number = 20) {
  const passwordHash = await hash('password123', 12);

  const users = Array.from({ length: count }, () => ({
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    passwordHash,
    role: 'USER' as const,
  }));

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`👤 Created ${count} random users`);
}
```

### 7. Configure Seed Command

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset"
  }
}
```

Install tsx for TypeScript execution:

```bash
pnpm add -D tsx
```

### 8. Create Seed Data Constants File

For reusable constants, create `prisma/seed-data.ts`:

```typescript
// prisma/seed-data.ts

export const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Home & Garden', slug: 'home-garden' },
  { name: 'Books', slug: 'books' },
  { name: 'Sports', slug: 'sports' },
] as const;

export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN' as const,
  },
  user: {
    email: 'user@example.com',
    name: 'Test User',
    role: 'USER' as const,
  },
  demo: {
    email: 'demo@example.com',
    name: 'Demo Account',
    role: 'USER' as const,
  },
} as const;

// Default password for all seed users
export const SEED_PASSWORD = 'password123';
```

### 9. Document Seed Data

Create `/docs/database/seed-data.md`:

```markdown
# Seed Data

## Overview

Seed data provides consistent development and testing data.

## Running Seeds

```bash
# Seed the database
pnpm db:seed

# Reset and re-seed
pnpm db:reset
```

## Test Accounts

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@example.com | password123 | ADMIN | Admin testing |
| user@example.com | password123 | USER | Standard user testing |
| demo@example.com | password123 | USER | Demo/presentation |

## Data Quantities

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 3+ | Test accounts + random |
| Categories | 5 | Fixed reference data |
| Products | 50+ | Mix of fixed and random |
| Orders | 2+ | Sample completed and pending |

## Customizing Seed

Edit `prisma/seed.ts` to:
- Add more reference data
- Change product quantities
- Add edge case data
```

### 10. Edge Case Seeds

Include edge cases for testing:

```typescript
async function seedEdgeCases() {
  const category = await prisma.category.findFirst();
  if (!category) return;

  // Out of stock product
  await prisma.product.create({
    data: {
      name: 'Out of Stock Item',
      description: 'This product has no stock',
      price: 99.99,
      stock: 0,
      categoryId: category.id,
    },
  });

  // Expensive product
  await prisma.product.create({
    data: {
      name: 'Premium Luxury Item',
      description: 'High-value test product',
      price: 9999.99,
      stock: 1,
      categoryId: category.id,
    },
  });

  // Long name/description
  await prisma.product.create({
    data: {
      name: 'A'.repeat(200), // Max length test
      description: 'B'.repeat(1000),
      price: 10.00,
      stock: 10,
      categoryId: category.id,
    },
  });

  console.log('🔧 Created edge case data');
}
```

---

## Review Checklist

- [ ] Seed script runs without errors
- [ ] Reference data (categories, roles) seeded
- [ ] Test user accounts created
- [ ] Sample content with realistic data
- [ ] Edge cases included
- [ ] Seed command in package.json
- [ ] Seed data documented
- [ ] Password for test users documented

---

## AI Agent Prompt Template

```
Create seed data for the database.

Read:
- `prisma/schema.prisma` for the data model
- `/docs/requirements.md` for data context

Execute SOP-102 (Seed Data):
1. Create prisma/seed.ts with seed functions
2. Add reference data (categories, etc.)
3. Create test user accounts
4. Generate realistic sample content
5. Include edge cases
6. Configure seed command in package.json
7. Document in /docs/database/seed-data.md
```

---

## Outputs

- [ ] `prisma/seed.ts` — Seed script
- [ ] `prisma/seed-data.ts` — Seed constants (optional)
- [ ] `/docs/database/seed-data.md` — Seed documentation
- [ ] Seed command configured in package.json

---

## Related SOPs

- **SOP-101:** Schema Design (defines data model)
- **SOP-004:** Environment Setup (database connection)
- **SOP-500:** Unit Testing (seed data for tests)
