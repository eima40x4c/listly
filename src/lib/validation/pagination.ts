/**
 * Pagination Validation Schemas
 *
 * Standard pagination parameters for list endpoints.
 * Provides consistent pagination behavior across all API endpoints.
 *
 * @module lib/validation/pagination
 */

import { z } from 'zod';

/**
 * Pagination query parameters schema
 * - page: Page number (default: 1)
 * - limit: Items per page (1-100, default: 20)
 * - sort: Field to sort by (optional)
 * - order: Sort direction (asc/desc, default: desc)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type for pagination parameters
 */
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Helper to extract and validate pagination from URL search params
 *
 * @param searchParams - URLSearchParams from request
 * @returns Validated pagination parameters with defaults applied
 *
 * @example
 * ```ts
 * const { page, limit, sort, order } = parsePagination(request.nextUrl.searchParams);
 * ```
 */
export function parsePagination(
  // eslint-disable-next-line no-undef
  searchParams: URLSearchParams
): PaginationParams {
  return paginationSchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: searchParams.get('order') ?? undefined,
  });
}

/**
 * Helper to calculate pagination metadata
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 *
 * @example
 * ```ts
 * const meta = getPaginationMeta(1, 20, 100);
 * // { page: 1, limit: 20, total: 100, totalPages: 5 }
 * ```
 */
export function getPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Helper to calculate skip value for database queries
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Number of records to skip
 *
 * @example
 * ```ts
 * const skip = getSkip(2, 20); // 20 (skip first 20 records for page 2)
 * ```
 */
export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
