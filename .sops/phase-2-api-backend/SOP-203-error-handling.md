# SOP-203: Error Handling

## Purpose

Implement consistent, informative error handling across the application. Good error handling improves debugging, provides helpful user feedback, and prevents sensitive information leakage.

---

## Scope

- **Applies to:** All API routes and server-side code
- **Covers:** Error formats, error types, logging, client-friendly messages
- **Does not cover:** Frontend error UI (see Phase 3), monitoring (Phase 6)

---

## Prerequisites

- [ ] SOP-200 (API Design) completed — response formats defined
- [ ] Logger utility available (SOP-004)

---

## Procedure

### 1. Define Error Response Format

All errors should follow a consistent format:

```typescript
interface ErrorResponse {
  error: string; // Error code (machine-readable)
  message: string; // User-friendly message
  details?: unknown; // Additional context (validation errors, etc.)
  requestId?: string; // For debugging/support
}
```

**Example:**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password is required" }
  ],
  "requestId": "req_abc123"
}
```

### 2. Define Standard Error Codes

```typescript
// src/lib/errors/codes.ts

export const ErrorCodes = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',

  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

### 3. Create Custom Error Classes

```typescript
// src/lib/errors/AppError.ts

import { ErrorCode } from './codes';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

// Convenience subclasses
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super('INTERNAL_ERROR', message, 500);
  }
}
```

### 4. Create Error Handler Utility

```typescript
// src/lib/errors/handler.ts

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './AppError';
import { logger } from '@/lib/logger';

interface ErrorHandlerOptions {
  requestId?: string;
}

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): NextResponse {
  const { requestId } = options;

  // Known application error
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ...error.toJSON(),
        ...(requestId && { requestId }),
      },
      { status: error.statusCode }
    );
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details,
        ...(requestId && { requestId }),
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, requestId);
  }

  // Unknown error - log and return generic message
  logger.error('Unhandled error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    requestId,
  });

  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(requestId && { requestId }),
    },
    { status: 500 }
  );
}

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  requestId?: string
): NextResponse {
  const baseResponse = requestId ? { requestId } : {};

  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return NextResponse.json(
        {
          error: 'CONFLICT',
          message: 'A record with this value already exists',
          ...baseResponse,
        },
        { status: 409 }
      );

    case 'P2025': // Record not found
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: 'Record not found',
          ...baseResponse,
        },
        { status: 404 }
      );

    case 'P2003': // Foreign key constraint failure
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Related record not found',
          ...baseResponse,
        },
        { status: 400 }
      );

    default:
      logger.error('Prisma error', {
        code: error.code,
        message: error.message,
        requestId,
      });

      return NextResponse.json(
        {
          error: 'DATABASE_ERROR',
          message: 'A database error occurred',
          ...baseResponse,
        },
        { status: 500 }
      );
  }
}
```

### 5. Create Request Wrapper

```typescript
// src/lib/api/withErrorHandling.ts

import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/errors/handler';
import { nanoid } from 'nanoid';

type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const requestId = nanoid(10);

    try {
      // Add request ID to response headers
      const response = await handler(request, context);
      response.headers.set('X-Request-Id', requestId);
      return response;
    } catch (error) {
      return handleError(error, { requestId });
    }
  };
}
```

**Usage:**

```typescript
// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.string(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Zod validation - will be caught and formatted
  const data = createProductSchema.parse(body);

  // Check category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new ValidationError('Category not found', {
      field: 'categoryId',
      message: 'Invalid category ID',
    });
  }

  const product = await prisma.product.create({ data });

  return NextResponse.json({ data: product }, { status: 201 });
});
```

### 6. Create Simple Logger

```typescript
// src/lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, data?: LogData) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  // In development, pretty print
  if (process.env.NODE_ENV === 'development') {
    console[level](JSON.stringify(logEntry, null, 2));
  } else {
    // In production, single line JSON for log aggregators
    console[level](JSON.stringify(logEntry));
  }
}

export const logger = {
  debug: (message: string, data?: LogData) => log('debug', message, data),
  info: (message: string, data?: LogData) => log('info', message, data),
  warn: (message: string, data?: LogData) => log('warn', message, data),
  error: (message: string, data?: LogData) => log('error', message, data),
};
```

### 7. Document Error Codes

Add to `/docs/api/errors.md`:

````markdown
# API Error Codes

## Error Response Format

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": [...],
  "requestId": "req_abc123"
}
```
````

## Client Errors (4xx)

| Code               | Status | Description              |
| ------------------ | ------ | ------------------------ |
| `VALIDATION_ERROR` | 400    | Invalid request data     |
| `UNAUTHORIZED`     | 401    | Authentication required  |
| `FORBIDDEN`        | 403    | Insufficient permissions |
| `NOT_FOUND`        | 404    | Resource not found       |
| `CONFLICT`         | 409    | Resource already exists  |
| `RATE_LIMITED`     | 429    | Too many requests        |

## Business Errors

| Code                 | Status | Description                   |
| -------------------- | ------ | ----------------------------- |
| `INSUFFICIENT_STOCK` | 422    | Not enough product stock      |
| `PAYMENT_FAILED`     | 422    | Payment processing failed     |
| `ORDER_CANCELLED`    | 422    | Cannot modify cancelled order |

## Server Errors (5xx)

| Code                     | Status | Description                |
| ------------------------ | ------ | -------------------------- |
| `INTERNAL_ERROR`         | 500    | Unexpected server error    |
| `DATABASE_ERROR`         | 500    | Database operation failed  |
| `EXTERNAL_SERVICE_ERROR` | 502    | Third-party service failed |

## Handling Errors

### Request ID

Every response includes an `X-Request-Id` header. Include this ID when reporting issues.

### Validation Errors

Validation errors include a `details` array:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Minimum 8 characters" }
  ]
}
```

```

---

## Review Checklist

- [ ] Error response format standardized
- [ ] Error codes defined and documented
- [ ] Custom error classes created
- [ ] Error handler utility implemented
- [ ] Zod errors handled
- [ ] Prisma errors handled
- [ ] Logger implemented
- [ ] Request IDs added to responses
- [ ] No sensitive information in error messages
- [ ] All API routes use error handler

---

## AI Agent Prompt Template

```

Implement error handling for this project.

Read:

- `/docs/api/endpoints.md` for API structure
- Existing API routes in src/app/api/

Execute SOP-203 (Error Handling):

1. Define error response format
2. Create error code constants
3. Create custom error classes
4. Create error handler utility
5. Create request wrapper with error handling
6. Create logger utility
7. Document error codes

```

---

## Outputs

- [ ] `src/lib/errors/codes.ts` — Error code constants
- [ ] `src/lib/errors/AppError.ts` — Custom error classes
- [ ] `src/lib/errors/handler.ts` — Error handler utility
- [ ] `src/lib/api/withErrorHandling.ts` — Request wrapper
- [ ] `src/lib/logger.ts` — Logger utility
- [ ] `/docs/api/errors.md` — Error documentation

---

## Related SOPs

- **SOP-200:** API Design (response formats)
- **SOP-204:** Validation (validation errors)
- **SOP-602:** Monitoring (error tracking)

---

## Security Notes

| Do | Don't |
|----|-------|
| Return generic messages for 500 errors | Expose stack traces to clients |
| Log full errors server-side | Log passwords or tokens |
| Use request IDs for debugging | Expose internal system details |
| Document expected errors | Return database error messages |
```
