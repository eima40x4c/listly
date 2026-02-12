import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { getStoreService } from '@/services';

/**
 * GET /api/v1/stores/favorites
 * Get user's favorite stores
 */
export const GET = withAuthAndErrorHandling(async (_request, user) => {
  const storeService = getStoreService();
  const result = await storeService.getFavorites(user.id);

  return NextResponse.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/v1/stores/favorites
 * Add a store to favorites
 */
export const POST = withAuthAndErrorHandling(async (request, user) => {
  const body = await request.json();
  const { storeId } = body;

  if (!storeId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'storeId is required',
        },
      },
      { status: 400 }
    );
  }

  const storeService = getStoreService();
  await storeService.addFavorite(user.id, storeId);

  return NextResponse.json(
    {
      success: true,
      message: 'Store added to favorites',
    },
    { status: 201 }
  );
});

/**
 * DELETE /api/v1/stores/favorites
 * Remove a store from favorites
 */
export const DELETE = withAuthAndErrorHandling(async (request, user) => {
  const body = await request.json();
  const { storeId } = body;

  if (!storeId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'storeId is required',
        },
      },
      { status: 400 }
    );
  }

  const storeService = getStoreService();
  await storeService.removeFavorite(user.id, storeId);

  return new NextResponse(null, { status: 204 });
});
