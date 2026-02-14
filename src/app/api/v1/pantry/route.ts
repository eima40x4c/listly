import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import {
  createPantryItemSchema,
  pantryItemQuerySchema,
} from '@/lib/validation/schemas/pantry-item';
import { validateBody, validateQuery } from '@/lib/validation/validate';
import { getPantryService } from '@/services';

/**
 * GET /api/v1/pantry
 * Get pantry items for the current user
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = await validateQuery(
    searchParams,
    pantryItemQuerySchema
  );
  if (!queryValidation.success) return queryValidation.error;

  const filters = queryValidation.data;

  // Note: Pagination params (page, limit) are not currently in schema but can be passed
  // The service implementation handles pagination logic if we extended it,
  // currently service uses defaults or we could pass them if we updated schema.
  // For now, trusting service defaults or we could parse them manually here if critical.

  const pantryService = getPantryService();
  const result = await pantryService.getByUser(user.id, filters);

  return NextResponse.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

/**
 * POST /api/v1/pantry
 * Create a new pantry item
 */
export const POST = withAuthAndErrorHandling(async (request, user) => {
  // Validate request body
  const validation = await validateBody(request, createPantryItemSchema);
  if (!validation.success) return validation.error;

  const data = {
    ...validation.data,
    quantity: validation.data.quantity ?? 1,
  };

  const pantryService = getPantryService();
  const result = await pantryService.create(user.id, data);

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 201 }
  );
});
