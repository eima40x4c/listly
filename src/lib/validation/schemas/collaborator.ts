/**
 * Collaborator Validation Schemas
 *
 * Validation schemas for shopping list collaboration operations including
 * inviting users, updating roles, and managing collaborators.
 *
 * @module lib/validation/schemas/collaborator
 */

import { z } from 'zod';

import { email, id } from '../common';

/**
 * Add collaborator schema
 * - Email: required, valid email format
 * - Role: optional, defaults to EDITOR
 */
export const addCollaboratorSchema = z.object({
  email,
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']).default('EDITOR'),
});

/**
 * Add collaborator by user ID schema (internal use)
 * - UserId: required, valid CUID
 * - Role: optional, defaults to EDITOR
 */
export const addCollaboratorByIdSchema = z.object({
  userId: id,
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']).default('EDITOR'),
});

/**
 * Update collaborator role schema
 * - Role: required, VIEWER, EDITOR, or ADMIN
 */
export const updateCollaboratorRoleSchema = z.object({
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
});

/**
 * Collaborator ID parameter schema
 * - For route parameters like /api/lists/:listId/collaborators/:id
 */
export const collaboratorIdParamSchema = z.object({
  id,
});

/**
 * Accept/decline invitation schema
 * - Accept: boolean indicating acceptance
 */
export const respondToInvitationSchema = z.object({
  accept: z.boolean(),
});

// Type exports
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type AddCollaboratorByIdInput = z.infer<
  typeof addCollaboratorByIdSchema
>;
export type UpdateCollaboratorRoleInput = z.infer<
  typeof updateCollaboratorRoleSchema
>;
export type CollaboratorIdParam = z.infer<typeof collaboratorIdParamSchema>;
export type RespondToInvitationInput = z.infer<
  typeof respondToInvitationSchema
>;
