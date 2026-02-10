/**
 * Validation Utility Functions
 *
 * Helper functions for validating request bodies, query parameters, and path parameters
 * in Next.js API routes. Provides type-safe validation with automatic error responses.
 *
 * @module lib/validation/validate
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

/**
 * Successful validation result with parsed data
 */
interface ValidationResult<T> {
  success: true;
  data: T;
}

/**
 * Failed validation result with error response
 */
interface ValidationFailure {
  success: false;
  error: NextResponse;
}

/**
 * Validate and parse request body using Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result or error response
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const validation = await validateBody(request, createListSchema);
 *   if (!validation.success) return validation.error;
 *
 *   const { data } = validation;
 *   // data is type-safe and validated
 * }
 * ```
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T> | ValidationFailure> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            },
          },
          { status: 400 }
        ),
      };
    }

    // Handle malformed JSON
    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid JSON body',
          },
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate and parse URL query parameters using Zod schema
 *
 * @param searchParams - URLSearchParams from request
 * @param schema - Zod schema to validate against
 * @returns Validation result or error response
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const { searchParams } = new URL(request.url);
 *   const validation = validateQuery(searchParams, paginationSchema);
 *   if (!validation.success) return validation.error;
 *
 *   const { page, limit } = validation.data;
 * }
 * ```
 */
export function validateQuery<T>(
  // eslint-disable-next-line no-undef
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): ValidationResult<T> | ValidationFailure {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid query parameters',
              details: error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            },
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
          },
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate and parse route path parameters using Zod schema
 *
 * @param params - Route parameters object
 * @param schema - Zod schema to validate against
 * @returns Validation result or error response
 *
 * @example
 * ```ts
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: { id: string } }
 * ) {
 *   const validation = validateParams(params, listIdParamSchema);
 *   if (!validation.success) return validation.error;
 *
 *   const { id } = validation.data;
 * }
 * ```
 */
export function validateParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): ValidationResult<T> | ValidationFailure {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid path parameters',
              details: error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            },
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid path parameters',
          },
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Safely parse data without throwing errors
 * Returns null if validation fails
 *
 * @param data - Data to validate
 * @param schema - Zod schema to validate against
 * @returns Parsed data or null if invalid
 *
 * @example
 * ```ts
 * const userId = safeParse(params.id, id);
 * if (!userId) {
 *   return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
 * }
 * ```
 */
export function safeParse<T>(data: unknown, schema: ZodSchema<T>): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate data and throw error if invalid
 * Useful for service layer validation
 *
 * @param data - Data to validate
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 *
 * @example
 * ```ts
 * // In service layer
 * export async function createList(data: unknown) {
 *   const validData = validateOrThrow(data, createListSchema);
 *   return prisma.shoppingList.create({ data: validData });
 * }
 * ```
 */
export function validateOrThrow<T>(data: unknown, schema: ZodSchema<T>): T {
  return schema.parse(data);
}
