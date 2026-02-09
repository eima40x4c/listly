/**
 * Permission and Role Utilities
 *
 * Defines roles, permissions, and utility functions for checking access rights
 * in the Listly application. Unlike traditional RBAC systems with system-wide roles,
 * Listly uses resource-based permissions focused on ownership and collaboration.
 *
 * @module lib/auth/permissions
 */

/**
 * Collaboration role for shared shopping lists.
 * Determines what actions a collaborator can perform on a shared list.
 */
export type CollaboratorRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

/**
 * List access role, including the special 'owner' pseudo-role.
 * Used to represent the user's relationship to a shopping list.
 */
export type ListRole = CollaboratorRole | 'owner' | null;

/**
 * Role hierarchy levels for comparison.
 * Higher numbers = more permissions.
 */
const ROLE_HIERARCHY: Record<Exclude<ListRole, null>, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  owner: 4,
};

/**
 * Check if a role has at least the specified minimum role level.
 *
 * @param role - User's current role
 * @param minimumRole - Minimum required role
 * @returns True if user's role meets or exceeds the minimum
 *
 * @example
 * ```ts
 * hasMinimumRole('ADMIN', 'EDITOR') // true
 * hasMinimumRole('EDITOR', 'ADMIN') // false
 * hasMinimumRole('owner', 'ADMIN') // true
 * hasMinimumRole(null, 'VIEWER') // false
 * ```
 */
export function hasMinimumRole(
  role: ListRole,
  minimumRole: Exclude<ListRole, null>
): boolean {
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Check if user can view a list (any role including VIEWER).
 *
 * @param role - User's role for the list
 * @returns True if user can view the list
 */
export function canViewList(role: ListRole): boolean {
  return role !== null;
}

/**
 * Check if user can view list items (any role including VIEWER).
 *
 * @param role - User's role for the list
 * @returns True if user can view items
 */
export function canViewItems(role: ListRole): boolean {
  return role !== null;
}

/**
 * Check if user can add or edit items (EDITOR, ADMIN, or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can edit items
 */
export function canEditItems(role: ListRole): boolean {
  return hasMinimumRole(role, 'EDITOR');
}

/**
 * Check if user can delete items (EDITOR, ADMIN, or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can delete items
 */
export function canDeleteItems(role: ListRole): boolean {
  return hasMinimumRole(role, 'EDITOR');
}

/**
 * Check if user can check/uncheck items (EDITOR, ADMIN, or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can toggle item status
 */
export function canToggleItems(role: ListRole): boolean {
  return hasMinimumRole(role, 'EDITOR');
}

/**
 * Check if user can edit list details (name, budget, etc.) - requires ADMIN or owner.
 *
 * @param role - User's role for the list
 * @returns True if user can edit list details
 */
export function canEditList(role: ListRole): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

/**
 * Check if user can delete or archive the list (ADMIN or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can delete the list
 */
export function canDeleteList(role: ListRole): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

/**
 * Check if user can view collaborators (EDITOR, ADMIN, or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can view collaborators
 */
export function canViewCollaborators(role: ListRole): boolean {
  return hasMinimumRole(role, 'EDITOR');
}

/**
 * Check if user can add/remove collaborators (ADMIN or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can manage collaborators
 */
export function canManageCollaborators(role: ListRole): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

/**
 * Check if user can change collaborator roles (ADMIN or owner).
 *
 * @param role - User's role for the list
 * @returns True if user can change roles
 */
export function canChangeRoles(role: ListRole): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

/**
 * Check if user is the owner of the list (highest privilege).
 *
 * @param role - User's role for the list
 * @returns True if user is the owner
 */
export function isOwner(role: ListRole): boolean {
  return role === 'owner';
}

/**
 * Check if user can leave the list (any collaborator, but not owner).
 * Owners cannot leave their own lists - they must transfer ownership or delete.
 *
 * @param role - User's role for the list
 * @returns True if user can leave the list
 */
export function canLeaveList(role: ListRole): boolean {
  return role !== null && role !== 'owner';
}

/**
 * Get a human-readable description of what a role can do.
 *
 * @param role - Role to describe
 * @returns Description of permissions
 */
export function getRoleDescription(role: CollaboratorRole | 'owner'): string {
  const descriptions: Record<CollaboratorRole | 'owner', string> = {
    owner: 'Full control - can edit list, manage collaborators, and delete',
    ADMIN: 'Can edit list details, manage collaborators, and edit items',
    EDITOR: 'Can add, edit, and check off items',
    VIEWER: 'Can view the list and items (read-only)',
  };

  return descriptions[role];
}

/**
 * Validate that a role is a valid collaborator role.
 *
 * @param role - Role string to validate
 * @returns True if role is valid
 */
export function isValidCollaboratorRole(
  role: string
): role is CollaboratorRole {
  return role === 'VIEWER' || role === 'EDITOR' || role === 'ADMIN';
}

/**
 * Get the default role for new collaborators.
 *
 * @returns Default collaborator role
 */
export function getDefaultCollaboratorRole(): CollaboratorRole {
  return 'EDITOR';
}
