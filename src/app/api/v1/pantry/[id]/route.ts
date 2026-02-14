import { NextResponse } from 'next/server';

import { withAuthAndErrorHandling } from '@/lib/api/withErrorHandling';
import { updatePantryItemSchema } from '@/lib/validation/schemas/pantry-item';
import { validateBody } from '@/lib/validation/validate';
import { getPantryService } from '@/services';

/**
 * GET /api/v1/pantry/[id]
 * Get a specific pantry item
 */
export const GET = withAuthAndErrorHandling(async (request, user) => {
  // Extract ID from URL
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  const pantryService = getPantryService();
  const item = await pantryService.getByIdWithDetails(id, user.id);

  if (!item) {
    return NextResponse.json(
      { success: false, error: 'Pantry item not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: item,
  });
});

/**
 * PATCH /api/v1/pantry/[id]
 * Update a pantry item
 */
export const PATCH = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  // Validate request body
  const validation = await validateBody(request, updatePantryItemSchema);
  if (!validation.success) return validation.error;

  const data = validation.data;

  const pantryService = getPantryService();
  const updatedItem = await pantryService.update(id, user.id, data);

  return NextResponse.json({
    success: true,
    data: updatedItem,
  });
});

/**
 * DELETE /api/v1/pantry/[id]
 * Delete a pantry item
 */
export const DELETE = withAuthAndErrorHandling(async (request, user) => {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing ID' },
      { status: 400 }
    );
  }

  const pantryService = getPantryService();
  await pantryService.delete(id, user.id);

  return NextResponse.json({
    success: true,
    data: null,
  });
});
