/**
 * API Route Error Handling Wrapper
 *
 * Wraps API route handlers with automatic error handling and request ID generation.
 * Catches all errors and converts them to consistent JSON responses using handleError().
 *
 * @module lib/api/withErrorHandling
 */

import { nanoid } from 'nanoid';
import type { NextRequest, NextResponse } from 'next/server';

import { handleError } from '@/lib/errors/handler';

/**
 * API route handler function signature.
 *
 * @param request - NextRequest object
 * @param context - Optional route context (e.g., dynamic route params)
 * @returns NextResponse with JSON payload
 */
type RouteHandler = (
  _request: NextRequest,
  _context?: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with error handling.
 *
 * Automatically:
 * - Generates a unique request ID (10 characters)
 * - Adds X-Request-Id header to all responses
 * - Catches and formats all errors using handleError()
 * - Includes request ID in error responses for debugging
 *
 * @param handler - The route handler to wrap
 * @returns Wrapped handler with error handling
 *
 * @example
 * ```ts
 * // src/app/api/lists/route.ts
 * import { withErrorHandling } from '@/lib/api/withErrorHandling';
 * import { NotFoundError } from '@/lib/errors/AppError';
 *
 * export const GET = withErrorHandling(async (request) => {
 *   const lists = await getShoppingLists();
 *   return Response.json({ success: true, data: lists });
 * });
 *
 * export const POST = withErrorHandling(async (request) => {
 *   const body = await request.json();
 *   const list = await createShoppingList(body); // Throws ValidationError
 *   return Response.json({ success: true, data: list }, { status: 201 });
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/app/api/lists/[id]/route.ts
 * import { withErrorHandling } from '@/lib/api/withErrorHandling';
 * import { NotFoundError } from '@/lib/errors/AppError';
 *
 * export const GET = withErrorHandling(async (request, context) => {
 *   const { id } = context?.params ?? {};
 *   const list = await getShoppingList(id);
 *
 *   if (!list) {
 *     throw new NotFoundError('Shopping list');
 *   }
 *
 *   return Response.json({ success: true, data: list });
 * });
 * ```
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    // Generate unique request ID for tracing
    const requestId = nanoid(10);

    try {
      // Execute the handler
      const response = await handler(request, context);

      // Add request ID to response headers
      response.headers.set('X-Request-Id', requestId);

      return response;
    } catch (error) {
      // Handle error and return formatted response
      return handleError(error, { requestId });
    }
  };
}
