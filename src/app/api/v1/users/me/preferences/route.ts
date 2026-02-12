import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updatePreferencesSchema } from '@/lib/validation/schemas/user';
import { validateBody } from '@/lib/validation/validate';
import { getUserService } from '@/services';

/**
 * GET /api/v1/users/me/preferences
 * Get user preferences
 */
export const GET = withAuthAndErrorHandling(async (_request, user) => {
  const userService = getUserService();
  const result = await userService.getPreferences(user.id);

  return NextResponse.json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /api/v1/users/me/preferences
 * Update user preferences
 */
export const PATCH = withAuthAndErrorHandling(async (request, user) => {
  // Validate request body
  const validation = await validateBody(request, updatePreferencesSchema);
  if (!validation.success) return validation.error;

  const userService = getUserService();
  const result = await userService.updatePreferences(user.id, validation.data);

  return NextResponse.json({
    success: true,
    data: result,
  });
});
