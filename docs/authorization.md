# Authorization

## Overview

Listly uses **resource-based authorization** where access control is primarily determined by:

1. **Resource ownership** - Users can only access resources they own (lists, pantry items, recipes, etc.)
2. **Collaboration roles** - For shared shopping lists, collaborators have role-based permissions (VIEWER, EDITOR, ADMIN)
3. **User-scoped resources** - Most resources are inherently private to the user who created them

There are **no system-wide roles** (e.g., no admin users who can access all data). This reflects the application's design as a personal/household tool rather than a multi-tenant SaaS platform.

---

## Authorization Model

### Ownership-Based Access

Most resources in Listly follow a simple ownership pattern:

| Resource       | Owner Field | Access Rule                                |
| -------------- | ----------- | ------------------------------------------ |
| Shopping Lists | `ownerId`   | Owner OR collaborator                      |
| List Items     | via list    | Access inherited from parent shopping list |
| Pantry Items   | `userId`    | User can only access their own items       |
| Recipes        | `userId`    | User can only access their own recipes     |
| Meal Plans     | `userId`    | User can only access their own meal plans  |
| Preferences    | `userId`    | User can only access their own preferences |

### Collaboration Roles

Shopping lists support sharing with other users. Collaborators are assigned one of three roles:

| Role   | Permissions                                                         |
| ------ | ------------------------------------------------------------------- |
| VIEWER | View list, view items (read-only)                                   |
| EDITOR | View list, add/edit/check items, view collaborators                 |
| ADMIN  | All EDITOR permissions + edit list, manage collaborators, delete    |
| owner  | All ADMIN permissions + transfer ownership, permanent delete rights |

**Role hierarchy:**

```
owner > ADMIN > EDITOR > VIEWER
```

---

## Permission Matrix

### Shopping Lists

| Action               | Owner | ADMIN | EDITOR | VIEWER |
| -------------------- | ----- | ----- | ------ | ------ |
| View list            | ✅    | ✅    | ✅     | ✅     |
| Update list details  | ✅    | ✅    | ❌     | ❌     |
| Delete list          | ✅    | ✅    | ❌     | ❌     |
| Archive list         | ✅    | ✅    | ❌     | ❌     |
| View collaborators   | ✅    | ✅    | ✅     | ❌     |
| Add collaborators    | ✅    | ✅    | ❌     | ❌     |
| Remove collaborators | ✅    | ✅    | ❌     | ❌     |
| Change roles         | ✅    | ✅    | ❌     | ❌     |
| Leave list           | N/A   | ✅    | ✅     | ✅     |

### List Items

| Action        | Owner | ADMIN | EDITOR | VIEWER |
| ------------- | ----- | ----- | ------ | ------ |
| View items    | ✅    | ✅    | ✅     | ✅     |
| Add items     | ✅    | ✅    | ✅     | ❌     |
| Edit items    | ✅    | ✅    | ✅     | ❌     |
| Delete items  | ✅    | ✅    | ✅     | ❌     |
| Check/uncheck | ✅    | ✅    | ✅     | ❌     |
| Reorder items | ✅    | ✅    | ✅     | ❌     |

### User Resources (Pantry, Recipes, Meal Plans)

| Action              | Owner | Others |
| ------------------- | ----- | ------ |
| List own resources  | ✅    | ❌     |
| View own resource   | ✅    | ❌     |
| Create resource     | ✅    | ❌     |
| Update own resource | ✅    | ❌     |
| Delete own resource | ✅    | ❌     |

**Note:** User-scoped resources (pantry, recipes, meal plans) are **never shared** - they always belong to a single user.

### User Profile & Preferences

| Action             | User | Others |
| ------------------ | ---- | ------ |
| View own profile   | ✅   | ❌     |
| Update own profile | ✅   | ❌     |
| Delete own account | ✅   | ❌     |
| View preferences   | ✅   | ❌     |
| Update preferences | ✅   | ❌     |

---

## Implementation Patterns

### 1. Ownership Check

For resources owned by a user (pantry, recipes, meal plans):

```typescript
// Check if user owns the resource
const resource = await prisma.pantryItem.findUnique({
  where: { id: resourceId },
  select: { userId: true },
});

if (!resource || resource.userId !== currentUserId) {
  return forbidden();
}
```

### 2. List Collaboration Check

For shopping lists (owner + collaborators):

```typescript
// Check if user has access to the list
const list = await prisma.shoppingList.findFirst({
  where: {
    id: listId,
    OR: [
      { ownerId: currentUserId },
      { collaborators: { some: { userId: currentUserId } } },
    ],
  },
  include: {
    collaborators: {
      where: { userId: currentUserId },
      select: { role: true },
    },
  },
});

if (!list) {
  return notFound();
}

// Determine user's role
const isOwner = list.ownerId === currentUserId;
const collaborator = list.collaborators[0];
const role = isOwner ? 'owner' : collaborator?.role;
```

### 3. Role-Based Permission Check

For actions requiring specific roles:

```typescript
// Require at least EDITOR role
function requireEditorRole(role: string): void {
  if (role === 'VIEWER' || !role) {
    throw new ForbiddenError('Editor role required');
  }
}

// Require ADMIN or owner
function requireAdminRole(role: string): void {
  if (role !== 'ADMIN' && role !== 'owner') {
    throw new ForbiddenError('Admin role required');
  }
}
```

### 4. Item Access via Parent List

List items inherit permissions from their parent shopping list:

```typescript
// Get item with list access check
const item = await prisma.listItem.findFirst({
  where: {
    id: itemId,
    list: {
      OR: [
        { ownerId: currentUserId },
        { collaborators: { some: { userId: currentUserId } } },
      ],
    },
  },
  include: {
    list: {
      include: {
        collaborators: {
          where: { userId: currentUserId },
        },
      },
    },
  },
});

if (!item) {
  return notFound();
}

// Check role for write operations
const role = getListRole(item.list, currentUserId);
if (needsEditPermission) {
  requireEditorRole(role);
}
```

---

## Authorization Utilities

### Core Functions

| Function                   | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `getListRole()`            | Determine user's role for a list           |
| `canAccessList()`          | Check if user can view a list              |
| `canEditList()`            | Check if user can edit list details        |
| `canManageCollaborators()` | Check if user can add/remove collaborators |
| `canEditItems()`           | Check if user can modify list items        |
| `requireListAccess()`      | Throw error if user cannot access list     |
| `requireEditorRole()`      | Throw error if user is not EDITOR or above |
| `requireAdminRole()`       | Throw error if user is not ADMIN or owner  |

### Database Query Helpers

```typescript
// Prisma where clause for lists accessible by user
function accessibleListsWhere(userId: string) {
  return {
    OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
  };
}

// Include user's collaboration role
function includeUserRole(userId: string) {
  return {
    collaborators: {
      where: { userId },
      select: { role: true },
    },
  };
}
```

---

## API Route Protection

### Pattern 1: User-Scoped Resources (Simple)

```typescript
// GET /api/pantry
export async function GET(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    const items = await prisma.pantryItem.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, data: items });
  });
}
```

### Pattern 2: List Access (Ownership + Collaboration)

```typescript
// GET /api/lists/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (request, user) => {
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: user.id },
          { collaborators: { some: { userId: user.id } } },
        ],
      },
    });

    if (!list) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'List not found' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: list });
  });
}
```

### Pattern 3: Role-Based Actions

```typescript
// PATCH /api/lists/:id (edit list details - requires ADMIN or owner)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (request, user) => {
    const { list, role } = await getListWithRole(params.id, user.id);

    if (!list) {
      return notFound();
    }

    // Only owner and ADMIN can edit list details
    if (role !== 'owner' && role !== 'ADMIN') {
      return forbidden('You need admin permission to edit this list');
    }

    const data = await request.json();
    const updated = await prisma.shoppingList.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  });
}
```

---

## Error Responses

### 401 Unauthorized

Returned when no valid authentication is present.

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden

Returned when user is authenticated but lacks permission.

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

### 404 Not Found (Security)

When a resource doesn't exist OR user lacks access, return 404 (don't leak existence).

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**Security Note:** Never distinguish between "resource doesn't exist" and "you don't have access" - always return 404 for both to prevent information disclosure.

---

## Testing Authorization

### Unit Tests

Test permission checking functions:

```typescript
describe('getListRole', () => {
  it('returns owner for list owner', () => {
    expect(getListRole(list, ownerId)).toBe('owner');
  });

  it('returns collaborator role', () => {
    expect(getListRole(list, collaboratorId)).toBe('EDITOR');
  });

  it('returns null for non-members', () => {
    expect(getListRole(list, randomUserId)).toBeNull();
  });
});
```

### Integration Tests

Test API endpoints with different user contexts:

```typescript
describe('PATCH /api/lists/:id', () => {
  it('allows owner to update list', async () => {
    const response = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(response.status).toBe(200);
  });

  it('allows ADMIN to update list', async () => {
    const response = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(response.status).toBe(200);
  });

  it('forbids EDITOR from updating list', async () => {
    const response = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${editorToken}` },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(response.status).toBe(403);
  });

  it('returns 404 for non-members', async () => {
    const response = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${otherUserToken}` },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(response.status).toBe(404);
  });
});
```

---

## Security Best Practices

1. **Always authenticate first** - Use `withAuth()` wrapper for all protected routes
2. **Fail securely** - Return 404 instead of 403 when user shouldn't know resource exists
3. **Check at the database level** - Include access checks in the query itself when possible
4. **Validate ownership** - Never trust client-provided owner IDs
5. **Log authorization failures** - Track denied access attempts for security monitoring
6. **Test negative cases** - Ensure unauthorized access is properly blocked
7. **Apply least privilege** - Default to most restrictive role (VIEWER) when unsure

---

## Future Enhancements

Potential authorization features for later phases:

- **Public lists** - Allow read-only sharing via public links (requires `isPublic` field)
- **Invitation links** - Generate shareable links for easy collaboration
- **Permission inheritance** - Meal plans could optionally inherit recipe permissions
- **Audit log** - Track who accessed/modified what and when
- **Rate limiting by user** - Prevent abuse on a per-user basis
- **Resource quotas** - Limit number of lists/items per user

---

## Related Documentation

- [Authentication](./authentication.md) - How users prove their identity
- [API Specification](./api/openapi.yaml) - Complete API endpoint definitions
- [Database Schema](./database/schema.md) - Data model and relationships
- [Requirements](./requirements.md) - User stories and access requirements
