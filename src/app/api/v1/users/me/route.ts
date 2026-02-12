import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updateUserSchema } from '@/lib/validation/schemas/user';
import { validateBody } from '@/lib/validation/validate';
import { getUserService } from '@/services';

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
export const GET = withAuthAndErrorHandling(async (_request, user) => {
  const userService = getUserService();
  const result = await userService.getById(user.id);

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /api/v1/users/me
 * Update current user profile
 */
export const PATCH = withAuthAndErrorHandling(async (request, user) => {
  // Validate request body
  const validation = await validateBody(request, updateUserSchema);
  if (!validation.success) return validation.error;

  const userService = getUserService();
  const result = await userService.updateProfile(user.id, validation.data);

  return NextResponse.json({
    success: true,
    data: result,
  });
});

/**
 * DELETE /api/v1/users/me
 * Delete current user account
 */
export const DELETE = withAuthAndErrorHandling(async (_request, user) => {
  const userService = getUserService();
  await userService.deleteAccount(user.id);

  return new NextResponse(null, { status: 204 });
});
