/**
 * Authorization Middleware for API Routes
 *
 * Provides middleware functions for protecting API routes with authorization checks.
 * Builds on top of authentication (withAuth) to add resource-level access control.
 *
 * @module lib/auth/authorize
 */

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';

import type { ListRole } from './permissions';

/**
 * Shopping list with user's role information.
 */
export interface ListWithRole {
  id: string;
  ownerId: string;
  role: ListRole;
}

/**
 * Get user's role for a specific shopping list.
 *
 * @param listId - Shopping list ID
 * @param userId - User ID to check role for
 * @returns Object with list data and user's role, or null if no access
 *
 * @example
 * ```ts
 * const result = await getListRole('list123', 'user456');
 * if (!result) {
 *   return notFound();
 * }
 * console.log(result.role); // 'owner', 'ADMIN', 'EDITOR', 'VIEWER', or null
 * ```
 */
export async function getListRole(
  listId: string,
  userId: string
): Promise<ListWithRole | null> {
  const list = await prisma.shoppingList.findFirst({
    where: {
      id: listId,
      OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
    },
    select: {
      id: true,
      ownerId: true,
      collaborators: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!list) {
    return null;
  }

  // Determine role: owner or collaborator role
  const isOwner = list.ownerId === userId;
  const role: ListRole = isOwner
    ? 'owner'
    : (list.collaborators[0]?.role as ListRole) || null;

  return {
    id: list.id,
    ownerId: list.ownerId,
    role,
  };
}

/**
 * Check if a user can access a shopping list.
 *
 * @param listId - Shopping list ID
 * @param userId - User ID
 * @returns True if user has any access (owner or collaborator)
 */
export async function canAccessList(
  listId: string,
  userId: string
): Promise<boolean> {
  const result = await getListRole(listId, userId);
  return result !== null;
}

/**
 * Check if a user owns a specific resource.
 *
 * @param model - Prisma model name
 * @param resourceId - Resource ID
 * @param userId - User ID
 * @returns True if user owns the resource
 *
 * @example
 * ```ts
 * const isOwner = await isResourceOwner('pantryItem', itemId, userId);
 * if (!isOwner) {
 *   return forbidden();
 * }
 * ```
 */
export async function isResourceOwner(
  model: 'pantryItem' | 'recipe' | 'mealPlan',
  resourceId: string,
  userId: string
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resource = await (prisma[model] as any).findUnique({
    where: { id: resourceId },
    select: { userId: true },
  });

  return resource?.userId === userId;
}

/**
 * Require that a user can access a list.
 * Throws appropriate error responses if access is denied.
 *
 * @param listId - Shopping list ID
 * @param userId - User ID
 * @returns List with role information
 * @throws NextResponse with 404 if user cannot access list
 *
 * @example
 * ```ts
 * export async function GET(request, { params }) {
 *   return withAuth(request, async (request, user) => {
 *     const result = await requireListAccess(params.id, user.id);
 *     if (result instanceof NextResponse) {
 *       return result; // Error response
 *     }
 *
 *     // User has access, continue...
 *     const { role } = result;
 *   });
 * }
 * ```
 */
export async function requireListAccess(
  listId: string,
  userId: string
): Promise<ListWithRole | NextResponse> {
  const result = await getListRole(listId, userId);

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'List not found',
        },
      },
      { status: 404 }
    );
  }

  return result;
}

/**
 * Require that a user owns a resource.
 * Returns error response if ownership check fails.
 *
 * @param model - Prisma model name
 * @param resourceId - Resource ID
 * @param userId - User ID
 * @returns True if ownership verified, or error response
 *
 * @example
 * ```ts
 * const ownershipCheck = await requireOwnership('recipe', recipeId, user.id);
 * if (ownershipCheck instanceof NextResponse) {
 *   return ownershipCheck; // Not found error
 * }
 * ```
 */
export async function requireOwnership(
  model: 'pantryItem' | 'recipe' | 'mealPlan',
  resourceId: string,
  userId: string
): Promise<true | NextResponse> {
  const isOwner = await isResourceOwner(model, resourceId, userId);

  if (!isOwner) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      },
      { status: 404 }
    );
  }

  return true;
}

/**
 * Check if user has access to a list item (via parent list access).
 *
 * @param itemId - List item ID
 * @param userId - User ID
 * @returns Item with parent list role, or null if no access
 */
export async function getItemAccess(
  itemId: string,
  userId: string
): Promise<{ itemId: string; listId: string; role: ListRole } | null> {
  const item = await prisma.listItem.findFirst({
    where: {
      id: itemId,
      list: {
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      },
    },
    select: {
      id: true,
      listId: true,
      list: {
        select: {
          ownerId: true,
          collaborators: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!item) {
    return null;
  }

  // Determine role
  const isOwner = item.list.ownerId === userId;
  const role: ListRole = isOwner
    ? 'owner'
    : (item.list.collaborators[0]?.role as ListRole) || null;

  return {
    itemId: item.id,
    listId: item.listId,
    role,
  };
}

/**
 * Require access to a list item.
 * Returns item access info or error response.
 *
 * @param itemId - List item ID
 * @param userId - User ID
 * @returns Item access info or error response
 */
export async function requireItemAccess(
  itemId: string,
  userId: string
): Promise<{ itemId: string; listId: string; role: ListRole } | NextResponse> {
  const access = await getItemAccess(itemId, userId);

  if (!access) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Item not found',
        },
      },
      { status: 404 }
    );
  }

  return access;
}

/**
 * Create a standard 403 Forbidden response.
 *
 * @param message - Optional custom error message
 * @returns NextResponse with 403 status
 */
export function forbidden(
  message = 'You do not have permission to perform this action'
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
    },
    { status: 403 }
  );
}

/**
 * Create a standard 404 Not Found response.
 *
 * @param message - Optional custom error message
 * @returns NextResponse with 404 status
 */
export function notFound(message = 'Resource not found'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message,
      },
    },
    { status: 404 }
  );
}

/**
 * Build a Prisma where clause for lists accessible by a user.
 * Useful for filtering queries to only show accessible lists.
 *
 * @param userId - User ID
 * @returns Prisma where clause
 *
 * @example
 * ```ts
 * const lists = await prisma.shoppingList.findMany({
 *   where: {
 *     ...accessibleListsWhere(user.id),
 *     status: 'ACTIVE',
 *   },
 * });
 * ```
 */
export function accessibleListsWhere(userId: string) {
  return {
    OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
  };
}

/**
 * Build a Prisma include clause to get user's role for a list.
 *
 * @param userId - User ID
 * @returns Prisma include clause
 *
 * @example
 * ```ts
 * const list = await prisma.shoppingList.findUnique({
 *   where: { id: listId },
 *   include: includeUserRole(user.id),
 * });
 *
 * const isOwner = list.ownerId === user.id;
 * const role = isOwner ? 'owner' : list.collaborators[0]?.role;
 * ```
 */
export function includeUserRole(userId: string) {
  return {
    collaborators: {
      where: { userId },
      select: { role: true },
    },
  };
}
