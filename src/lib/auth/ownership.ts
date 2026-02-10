/**
 * Resource Ownership Utilities
 *
 * Helper functions for checking and validating ownership of user-scoped resources
 * like pantry items, recipes, and meal plans. These resources are always owned by
 * a single user and are never shared.
 *
 * NOTE: For shopping list access (which involves both ownership AND collaboration),
 * use the functions in `@/lib/auth/authorize` instead:
 * - `getListRole()` — Get a user's role for a list (owner or collaborator role)
 * - `canAccessList()` — Check if user has any access to a list
 * - `requireListAccess()` — Require access or return error response
 * - `getItemAccess()` — Check access to a list item via parent list
 * - `requireItemAccess()` — Require item access or return error response
 * - `isResourceOwner()` — Generic single-resource ownership check
 *
 * @module lib/auth/ownership
 */

import { prisma } from '@/lib/db';

/**
 * Check if a user owns a pantry item.
 *
 * @param userId - User ID
 * @param pantryItemId - Pantry item ID
 * @returns True if user owns the item
 *
 * @example
 * ```ts
 * if (await isPantryItemOwner(user.id, itemId)) {
 *   // Allow access
 * }
 * ```
 */
export async function isPantryItemOwner(
  userId: string,
  pantryItemId: string
): Promise<boolean> {
  const item = await prisma.pantryItem.findUnique({
    where: { id: pantryItemId },
    select: { userId: true },
  });

  return item?.userId === userId;
}

/**
 * Check if a user owns a recipe.
 *
 * @param userId - User ID
 * @param recipeId - Recipe ID
 * @returns True if user owns the recipe
 */
export async function isRecipeOwner(
  userId: string,
  recipeId: string
): Promise<boolean> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { userId: true },
  });

  return recipe?.userId === userId;
}

/**
 * Check if a user owns a meal plan.
 *
 * @param userId - User ID
 * @param mealPlanId - Meal plan ID
 * @returns True if user owns the meal plan
 */
export async function isMealPlanOwner(
  userId: string,
  mealPlanId: string
): Promise<boolean> {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    select: { userId: true },
  });

  return mealPlan?.userId === userId;
}

/**
 * Get all shopping list IDs accessible by a user.
 * Useful for bulk operations or filtering.
 *
 * @param userId - User ID
 * @returns Array of accessible list IDs
 *
 * @example
 * ```ts
 * const listIds = await getAccessibleListIds(user.id);
 * const items = await prisma.listItem.findMany({
 *   where: { listId: { in: listIds } },
 * });
 * ```
 */
export async function getAccessibleListIds(userId: string): Promise<string[]> {
  const lists = await prisma.shoppingList.findMany({
    where: {
      OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
    },
    select: { id: true },
  });

  return lists.map((list) => list.id);
}

/**
 * Check if a user has a specific collaborator relationship.
 *
 * @param userId - User ID
 * @param listId - Shopping list ID
 * @returns Collaborator record or null
 */
export async function getCollaboration(
  userId: string,
  listId: string
): Promise<{ id: string; role: string } | null> {
  const collaboration = await prisma.listCollaborator.findFirst({
    where: {
      userId,
      listId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  return collaboration;
}

/**
 * Check if a resource exists and get its owner ID.
 * Useful for conditional checks without exposing existence to unauthorized users.
 *
 * @param model - Prisma model name
 * @param resourceId - Resource ID
 * @returns Owner ID or null if resource doesn't exist
 */
export async function getResourceOwnerId(
  model: 'pantryItem' | 'recipe' | 'mealPlan' | 'shoppingList',
  resourceId: string
): Promise<string | null> {
  let ownerField: string;

  // Shopping lists use 'ownerId', others use 'userId'
  if (model === 'shoppingList') {
    ownerField = 'ownerId';
  } else {
    ownerField = 'userId';
  }

  const resource = await (prisma[model] as any).findUnique({
    where: { id: resourceId },
    select: { [ownerField]: true },
  });

  return resource?.[ownerField] || null;
}

/**
 * Verify that a user owns a resource and return the resource.
 * Returns null if resource doesn't exist or user is not the owner.
 *
 * @param model - Prisma model name
 * @param resourceId - Resource ID
 * @param userId - User ID
 * @param select - Fields to select (default: all)
 * @returns Resource data or null
 *
 * @example
 * ```ts
 * const recipe = await getOwnedResource(
 *   'recipe',
 *   recipeId,
 *   user.id,
 *   { id: true, title: true, ingredients: true }
 * );
 *
 * if (!recipe) {
 *   return notFound();
 * }
 * ```
 */
export async function getOwnedResource<T>(
  model: 'pantryItem' | 'recipe' | 'mealPlan',
  resourceId: string,
  userId: string,
  select?: any
): Promise<T | null> {
  const resource = await (prisma[model] as any).findFirst({
    where: {
      id: resourceId,
      userId,
    },
    select,
  });

  return resource;
}
