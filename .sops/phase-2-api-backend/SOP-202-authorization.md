# SOP-202: Authorization

## Purpose

Implement access control to ensure users can only access resources and perform actions they're permitted to. Authorization happens after authentication and determines what an authenticated user can do.

---

## Scope

- **Applies to:** All applications with varying access levels
- **Covers:** Role-based access control (RBAC), resource ownership, permission checking
- **Does not cover:** Authentication (SOP-201), API rate limiting

---

## Prerequisites

- [ ] SOP-201 (Authentication) completed
- [ ] User roles defined in schema
- [ ] Resource ownership patterns identified

---

## Procedure

### 1. Identify Authorization Requirements

| Access Pattern | Example |
|----------------|---------|
| **Role-based** | Only admins can delete products |
| **Ownership** | Users can only edit their own orders |
| **Relationship** | Team members can view team resources |
| **Conditional** | Users can edit orders only if status is "pending" |

### 2. Define Roles and Permissions

Create `/docs/auth/permissions.md`:

```markdown
# Permissions Matrix

## Roles

| Role | Description |
|------|-------------|
| USER | Standard authenticated user |
| ADMIN | Full system access |

## Resource Permissions

### Users Resource
| Action | USER | ADMIN |
|--------|------|-------|
| List all | ❌ | ✅ |
| View own | ✅ | ✅ |
| View any | ❌ | ✅ |
| Update own | ✅ | ✅ |
| Update any | ❌ | ✅ |
| Delete own | ❌ | ✅ |
| Delete any | ❌ | ✅ |

### Products Resource
| Action | USER | ADMIN |
|--------|------|-------|
| List | ✅ | ✅ |
| View | ✅ | ✅ |
| Create | ❌ | ✅ |
| Update | ❌ | ✅ |
| Delete | ❌ | ✅ |

### Orders Resource
| Action | USER | ADMIN |
|--------|------|-------|
| List own | ✅ | ✅ |
| List all | ❌ | ✅ |
| View own | ✅ | ✅ |
| View any | ❌ | ✅ |
| Create | ✅ | ✅ |
| Cancel own (if pending) | ✅ | ✅ |
| Update status | ❌ | ✅ |
```

### 3. Create Permission Utilities

```typescript
// src/lib/auth/permissions.ts

export type Role = 'USER' | 'ADMIN';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'list';
export type Resource = 'users' | 'products' | 'orders' | 'categories';

// Permission definitions
const permissions: Record<Role, Record<Resource, Action[]>> = {
  USER: {
    users: ['read'], // Own profile only
    products: ['read', 'list'],
    orders: ['create', 'read', 'list'], // Own orders only
    categories: ['read', 'list'],
  },
  ADMIN: {
    users: ['create', 'read', 'update', 'delete', 'list'],
    products: ['create', 'read', 'update', 'delete', 'list'],
    orders: ['create', 'read', 'update', 'delete', 'list'],
    categories: ['create', 'read', 'update', 'delete', 'list'],
  },
};

export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  return permissions[role]?.[resource]?.includes(action) ?? false;
}

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN';
}
```

### 4. Create Authorization Middleware

```typescript
// src/lib/auth/authorize.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasPermission, Resource, Action, Role } from './permissions';

interface AuthorizeOptions {
  resource: Resource;
  action: Action;
}

export async function authorize(
  request: NextRequest,
  options: AuthorizeOptions
): Promise<{ user: { id: string; role: Role } } | NextResponse> {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session?.user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  const role = session.user.role as Role;

  // Check permission
  if (!hasPermission(role, options.resource, options.action)) {
    return NextResponse.json(
      {
        error: 'FORBIDDEN',
        message: `You don't have permission to ${options.action} ${options.resource}`,
      },
      { status: 403 }
    );
  }

  return { user: { id: session.user.id, role } };
}
```

**Usage in API routes:**

```typescript
// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/authorize';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Check authorization
  const authResult = await authorize(request, {
    resource: 'products',
    action: 'create',
  });

  // If authorization failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Proceed with creating product
  const body = await request.json();
  const product = await prisma.product.create({
    data: body,
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
```

### 5. Ownership Checks

```typescript
// src/lib/auth/ownership.ts

import { prisma } from '@/lib/db';

export async function isOrderOwner(
  userId: string,
  orderId: string
): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  return order?.userId === userId;
}

export async function canAccessOrder(
  userId: string,
  userRole: string,
  orderId: string
): Promise<boolean> {
  // Admins can access any order
  if (userRole === 'ADMIN') {
    return true;
  }

  // Users can only access their own orders
  return isOrderOwner(userId, orderId);
}
```

**Usage:**

```typescript
// src/app/api/orders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/authorize';
import { canAccessOrder } from '@/lib/auth/ownership';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authorize(request, {
    resource: 'orders',
    action: 'read',
  });

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Check ownership
  const canAccess = await canAccessOrder(user.id, user.role, params.id);
  if (!canAccess) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'You cannot access this order' },
      { status: 403 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Order not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: order });
}
```

### 6. Conditional Authorization

```typescript
// src/lib/auth/conditions.ts

import { prisma } from '@/lib/db';

export async function canCancelOrder(
  userId: string,
  userRole: string,
  orderId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true },
  });

  if (!order) {
    return { allowed: false, reason: 'Order not found' };
  }

  // Admins can cancel any order
  if (userRole === 'ADMIN') {
    return { allowed: true };
  }

  // Users can only cancel their own orders
  if (order.userId !== userId) {
    return { allowed: false, reason: 'You can only cancel your own orders' };
  }

  // Can only cancel pending orders
  if (order.status !== 'PENDING') {
    return {
      allowed: false,
      reason: 'Only pending orders can be cancelled',
    };
  }

  return { allowed: true };
}
```

### 7. Server Component Authorization

```typescript
// src/components/admin/AdminGuard.tsx

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

interface AdminGuardProps {
  children: React.ReactNode;
}

export async function AdminGuard({ children }: AdminGuardProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
```

**Usage:**

```typescript
// src/app/admin/layout.tsx

import { AdminGuard } from '@/components/admin/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
```

### 8. Client-Side Permission Checks

```typescript
// src/hooks/usePermissions.ts

'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, Resource, Action, Role } from '@/lib/auth/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const role = (session?.user?.role as Role) || 'USER';

  const can = (resource: Resource, action: Action): boolean => {
    if (!session?.user) return false;
    return hasPermission(role, resource, action);
  };

  const isAdmin = role === 'ADMIN';

  return { can, isAdmin, role };
}
```

**Usage in components:**

```tsx
// src/components/products/ProductActions.tsx

'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/Button';

export function ProductActions({ productId }: { productId: string }) {
  const { can } = usePermissions();

  return (
    <div>
      {can('products', 'update') && (
        <Button href={`/admin/products/${productId}/edit`}>Edit</Button>
      )}
      {can('products', 'delete') && (
        <Button variant="danger" onClick={() => deleteProduct(productId)}>
          Delete
        </Button>
      )}
    </div>
  );
}
```

---

## Review Checklist

- [ ] Roles defined in schema
- [ ] Permission matrix documented
- [ ] Permission utilities created
- [ ] Authorization middleware implemented
- [ ] Ownership checks for user-specific resources
- [ ] Conditional access rules implemented
- [ ] Server components protected
- [ ] Client-side permission hooks created
- [ ] All endpoints have authorization

---

## AI Agent Prompt Template

```
Implement authorization for this project.

Read:
- `/docs/auth/permissions.md` for permission matrix (or create it)
- `prisma/schema.prisma` for role definitions
- Existing auth code in src/lib/auth/

Execute SOP-202 (Authorization):
1. Define roles and permissions matrix
2. Create permission checking utilities
3. Create authorization middleware
4. Add ownership checks for user resources
5. Protect server components
6. Create client-side permission hooks
```

---

## Outputs

- [ ] `/docs/auth/permissions.md` — Permission matrix
- [ ] `src/lib/auth/permissions.ts` — Permission definitions
- [ ] `src/lib/auth/authorize.ts` — Authorization middleware
- [ ] `src/lib/auth/ownership.ts` — Ownership utilities
- [ ] `src/hooks/usePermissions.ts` — Client-side hook

---

## Related SOPs

- **SOP-201:** Authentication (identifies user)
- **SOP-200:** API Design (endpoint requirements)
- **SOP-203:** Error Handling (403 responses)
