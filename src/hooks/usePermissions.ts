/**
 * Client-Side Permission Hooks
 *
 * React hooks for checking permissions in client components.
 * These should be used for UI rendering decisions, but NEVER
 * as the sole security mechanism (always enforce on server).
 *
 * @module hooks/usePermissions
 */

'use client';

import { useCallback } from 'react';

import type { ListRole } from '@/lib/auth/permissions';
import {
  canDeleteItems,
  canDeleteList,
  canEditItems,
  canEditList,
  canLeaveList,
  canManageCollaborators,
  canToggleItems,
  canViewCollaborators,
  canViewItems,
  canViewList,
  isOwner,
} from '@/lib/auth/permissions';

/**
 * Hook for checking shopping list permissions.
 *
 * @param role - User's role for the list
 * @returns Object with permission check functions
 *
 * @example
 * ```tsx
 * function ListActions({ listId, userRole }) {
 *   const permissions = useListPermissions(userRole);
 *
 *   return (
 *     <div>
 *       {permissions.canEdit && (
 *         <button onClick={() => editList(listId)}>Edit List</button>
 *       )}
 *       {permissions.canManageCollaborators && (
 *         <button onClick={() => shareList(listId)}>Share</button>
 *       )}
 *       {permissions.canDelete && (
 *         <button onClick={() => deleteList(listId)}>Delete</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useListPermissions(role: ListRole) {
  // Memoize permission checks to avoid recalculating on every render
  const canView = useCallback(() => canViewList(role), [role]);
  const canEdit = useCallback(() => canEditList(role), [role]);
  const canDelete = useCallback(() => canDeleteList(role), [role]);
  const canManageCollab = useCallback(
    () => canManageCollaborators(role),
    [role]
  );
  const canViewCollab = useCallback(() => canViewCollaborators(role), [role]);
  const canLeave = useCallback(() => canLeaveList(role), [role]);
  const isOwnerRole = useCallback(() => isOwner(role), [role]);

  return {
    /** Can view the list */
    canView: canView(),
    /** Can edit list details (name, budget, etc.) */
    canEdit: canEdit(),
    /** Can delete or archive the list */
    canDelete: canDelete(),
    /** Can add/remove collaborators */
    canManageCollaborators: canManageCollab(),
    /** Can view list of collaborators */
    canViewCollaborators: canViewCollab(),
    /** Can leave the list (if not owner) */
    canLeave: canLeave(),
    /** Is the list owner */
    isOwner: isOwnerRole(),
    /** User's role */
    role,
  };
}

/**
 * Hook for checking item permissions within a list.
 *
 * @param role - User's role for the parent list
 * @returns Object with permission check functions for items
 *
 * @example
 * ```tsx
 * function ItemRow({ item, listRole }) {
 *   const permissions = useItemPermissions(listRole);
 *
 *   return (
 *     <div>
 *       <span>{item.name}</span>
 *       {permissions.canToggle && (
 *         <input
 *           type="checkbox"
 *           checked={item.isChecked}
 *           onChange={() => toggleItem(item.id)}
 *         />
 *       )}
 *       {permissions.canEdit && (
 *         <button onClick={() => editItem(item.id)}>Edit</button>
 *       )}
 *       {permissions.canDelete && (
 *         <button onClick={() => deleteItem(item.id)}>Delete</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useItemPermissions(role: ListRole) {
  const canView = useCallback(() => canViewItems(role), [role]);
  const canEdit = useCallback(() => canEditItems(role), [role]);
  const canDelete = useCallback(() => canDeleteItems(role), [role]);
  const canToggle = useCallback(() => canToggleItems(role), [role]);

  return {
    /** Can view items */
    canView: canView(),
    /** Can add, edit items */
    canEdit: canEdit(),
    /** Can delete items */
    canDelete: canDelete(),
    /** Can check/uncheck items */
    canToggle: canToggle(),
  };
}

/**
 * Combined hook for both list and item permissions.
 * Convenience wrapper around useListPermissions and useItemPermissions.
 *
 * @param role - User's role for the list
 * @returns Object with all permission checks
 *
 * @example
 * ```tsx
 * function ShoppingListPage({ listId, userRole }) {
 *   const permissions = usePermissions(userRole);
 *
 *   return (
 *     <div>
 *       <h1>Shopping List</h1>
 *
 *       {permissions.list.canEdit && (
 *         <button>Edit List Details</button>
 *       )}
 *
 *       {permissions.items.canEdit && (
 *         <button>Add Item</button>
 *       )}
 *
 *       {permissions.list.canManageCollaborators && (
 *         <button>Share List</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(role: ListRole) {
  const listPermissions = useListPermissions(role);
  const itemPermissions = useItemPermissions(role);

  return {
    list: listPermissions,
    items: itemPermissions,
  };
}

/**
 * Get a human-readable role name for display.
 *
 * @param role - User's role
 * @returns Display name
 *
 * @example
 * ```tsx
 * function CollaboratorBadge({ role }) {
 *   const roleName = useRoleDisplay(role);
 *   return <span className="badge">{roleName}</span>;
 * }
 * ```
 */
export function useRoleDisplay(role: ListRole): string {
  if (!role) return 'No Access';
  if (role === 'owner') return 'Owner';
  return role.charAt(0) + role.slice(1).toLowerCase(); // "EDITOR" → "Editor"
}
