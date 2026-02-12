import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import {
  createShoppingListSchema,
  shoppingListQuerySchema,
} from '@/lib/validation/schemas/shopping-list';
import { validateBody, validateQuery } from '@/lib/validation/validate';
import { getListService } from '@/services';

/**
 * GET /api/v1/lists
 * Get all lists for the current user
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = await validateQuery(
    searchParams,
    shoppingListQuerySchema
  );
  if (!queryValidation.success) return queryValidation.error;

  const { status, isTemplate, q } = queryValidation.data;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  const listService = getListService();
  const result = await listService.getByUser(user.id, {
    page,
    limit,
    status,
    isTemplate,
    search: q,
  });

  return NextResponse.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

/**
 * POST /api/v1/lists
 * Create a new shopping list
 */
export const POST = withAuthAndErrorHandling(async (request, user) => {
  // Validate request body
  const validation = await validateBody(request, createShoppingListSchema);
  if (!validation.success) return validation.error;

  const data = validation.data;

  const listService = getListService();
  const result = await listService.create(user.id, {
    ...data,
    ownerId: user.id,
  });

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 201 }
  );
});
