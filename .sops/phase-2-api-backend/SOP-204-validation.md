# SOP-204: Validation

## Purpose

Implement robust input validation to ensure data integrity, prevent security vulnerabilities, and provide helpful feedback to users. Validation happens at API boundaries before data reaches business logic.

---

## Scope

- **Applies to:** All API endpoints accepting user input
- **Covers:** Schema validation, sanitization, type coercion
- **Does not cover:** Business rule validation (separate concern)

---

## Prerequisites

- [ ] SOP-200 (API Design) completed — endpoints defined
- [ ] SOP-203 (Error Handling) completed — validation error format

---

## Procedure

### 1. Install Validation Library

```bash
pnpm add zod
```

Zod provides TypeScript-first schema validation with automatic type inference.

### 2. Create Base Validation Schemas

```typescript
// src/lib/validation/common.ts

import { z } from 'zod';

// Common field schemas
export const id = z.string().cuid();

export const email = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  );

export const name = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim();

export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export const positiveInt = z.coerce
  .number()
  .int('Must be a whole number')
  .positive('Must be positive');

export const price = z.coerce
  .number()
  .positive('Price must be positive')
  .multipleOf(0.01, 'Price can have at most 2 decimal places');

export const url = z.string().url('Invalid URL');

export const date = z.coerce.date();

export const boolean = z.coerce.boolean();
```

### 3. Create Pagination Schema

```typescript
// src/lib/validation/pagination.ts

import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Helper to extract pagination from URL search params
export function parsePagination(
  searchParams: URLSearchParams
): PaginationParams {
  return paginationSchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: searchParams.get('order') ?? undefined,
  });
}
```

### 4. Create Resource Schemas

```typescript
// src/lib/validation/schemas/user.ts

import { z } from 'zod';
import { email, password, name, id } from '../common';

export const registerSchema = z.object({
  email,
  password,
  name,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

```typescript
// src/lib/validation/schemas/product.ts

import { z } from 'zod';
import { name, price, positiveInt, id, url } from '../common';

export const createProductSchema = z.object({
  name: name.max(200, 'Name too long'),
  description: z.string().max(2000).optional(),
  price,
  stock: positiveInt.default(0),
  categoryId: id,
  imageUrl: url.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  q: z.string().optional(), // Search query
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
```

```typescript
// src/lib/validation/schemas/order.ts

import { z } from 'zod';
import { id, positiveInt } from '../common';

export const orderItemSchema = z.object({
  productId: id,
  quantity: positiveInt,
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
```

### 5. Create Validation Utility

```typescript
// src/lib/validation/validate.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

interface ValidationResult<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  error: NextResponse;
}

export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T> | ValidationFailure> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid JSON body' },
        { status: 400 }
      ),
    };
  }
}

export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid query' },
        { status: 400 }
      ),
    };
  }
}

export function validateParams<T>(
  params: Record<string, string>,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'Invalid path parameters',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid parameters' },
        { status: 400 }
      ),
    };
  }
}
```

### 6. Usage in API Routes

```typescript
// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateBody, validateQuery } from '@/lib/validation/validate';
import {
  createProductSchema,
  productQuerySchema,
} from '@/lib/validation/schemas/product';
import { paginationSchema } from '@/lib/validation/pagination';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate pagination
  const pagination = validateQuery(searchParams, paginationSchema);
  if (!pagination.success) return pagination.error;

  // Validate filters
  const filters = validateQuery(searchParams, productQuerySchema);
  if (!filters.success) return filters.error;

  const { page, limit, sort, order } = pagination.data;
  const { category, minPrice, maxPrice, inStock, q } = filters.data;

  // Build query
  const where = {
    ...(category && { category: { slug: category } }),
    ...(minPrice && { price: { gte: minPrice } }),
    ...(maxPrice && { price: { lte: maxPrice } }),
    ...(inStock && { stock: { gt: 0 } }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sort ? { [sort]: order } : { createdAt: order },
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  // Validate request body
  const validation = await validateBody(request, createProductSchema);
  if (!validation.success) return validation.error;

  const { data } = validation;

  // Create product
  const product = await prisma.product.create({
    data,
    include: { category: true },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
```

### 7. Path Parameter Validation

```typescript
// src/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateParams, validateBody } from '@/lib/validation/validate';
import { updateProductSchema } from '@/lib/validation/schemas/product';
import { id } from '@/lib/validation/common';
import { prisma } from '@/lib/db';

const paramsSchema = z.object({ id });

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const validation = validateParams(params, paramsSchema);
  if (!validation.success) return validation.error;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const paramsValidation = validateParams(params, paramsSchema);
  if (!paramsValidation.success) return paramsValidation.error;

  const bodyValidation = await validateBody(request, updateProductSchema);
  if (!bodyValidation.success) return bodyValidation.error;

  const product = await prisma.product.update({
    where: { id: params.id },
    data: bodyValidation.data,
    include: { category: true },
  });

  return NextResponse.json({ data: product });
}
```

### 8. Custom Validators

```typescript
// src/lib/validation/custom.ts

import { z } from 'zod';
import { prisma } from '@/lib/db';

// Async validation: check if email is unique
export async function isEmailUnique(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  return !user;
}

// Custom schema with refinement
export const uniqueEmailSchema = z
  .string()
  .email()
  .refine(async (email) => await isEmailUnique(email), {
    message: 'Email already registered',
  });

// Date range validation
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

// File upload validation
export const fileSchema = z.object({
  name: z.string(),
  type: z
    .string()
    .refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
      { message: 'Only JPEG, PNG, and WebP images are allowed' }
    ),
  size: z.number().max(5 * 1024 * 1024, 'File must be less than 5MB'),
});
```

### 9. Export All Schemas

```typescript
// src/lib/validation/index.ts

// Common schemas
export * from './common';
export * from './pagination';
export * from './validate';

// Resource schemas
export * from './schemas/user';
export * from './schemas/product';
export * from './schemas/order';
```

---

## Review Checklist

- [ ] Zod installed and configured
- [ ] Common field schemas defined
- [ ] Resource-specific schemas created
- [ ] Pagination schema created
- [ ] Validation utility functions created
- [ ] All endpoints validate input
- [ ] Error responses follow standard format
- [ ] Types are inferred from schemas
- [ ] Custom validators where needed

---

## AI Agent Prompt Template

```
Implement input validation for this project.

Read:
- `/docs/api/endpoints.md` for API structure
- `prisma/schema.prisma` for data types

Execute SOP-204 (Validation):
1. Create common validation schemas (email, password, etc.)
2. Create resource-specific schemas
3. Create pagination schema
4. Create validation utility functions
5. Apply validation to all API endpoints
```

---

## Outputs

- [ ] `src/lib/validation/common.ts` — Common field schemas
- [ ] `src/lib/validation/pagination.ts` — Pagination schema
- [ ] `src/lib/validation/validate.ts` — Validation utilities
- [ ] `src/lib/validation/schemas/*.ts` — Resource schemas
- [ ] `src/lib/validation/index.ts` — Exports

---

## Related SOPs

- **SOP-200:** API Design (endpoint contracts)
- **SOP-203:** Error Handling (validation error format)
- **SOP-101:** Schema Design (data types alignment)

---

## Best Practices

| Do                                  | Don't                             |
| ----------------------------------- | --------------------------------- |
| Validate early at API boundary      | Trust client-side validation      |
| Use type coercion for query params  | Assume correct types              |
| Sanitize strings (trim, lowercase)  | Allow leading/trailing whitespace |
| Provide specific error messages     | Return generic "invalid" messages |
| Infer TypeScript types from schemas | Duplicate type definitions        |
