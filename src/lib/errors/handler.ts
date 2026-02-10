/**
 * Error Handler Utility
 *
 * Central error handling logic that converts various error types into
 * consistent API responses. Handles AppError, Zod validation errors,
 * Prisma database errors, and unexpected errors.
 *
 * @module lib/errors/handler
 */

import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { logger } from '@/lib/logger';

import { AppError } from './AppError';
import { ErrorCodes } from './codes';

/**
 * Options for error handler.
 */
interface ErrorHandlerOptions {
  /**
   * Request ID for tracing (included in response).
   */
  requestId?: string;
}

/**
 * Convert any error into a standardized NextResponse.
 *
 * Handles:
 * - AppError instances (known application errors)
 * - Zod validation errors
 * - Prisma database errors
 * - Unknown errors (logged and returned as generic 500)
 *
 * @param error - The error to handle
 * @param options - Optional request ID for tracing
 * @returns NextResponse with appropriate error payload and status
 *
 * @example
 * ```ts
 * import { handleError } from '@/lib/errors/handler';
 *
 * try {
 *   const user = await getUser(id);
 * } catch (error) {
 *   return handleError(error, { requestId: 'req_123' });
 * }
 * ```
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): NextResponse {
  const { requestId } = options;

  // Known application error
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ...error.toJSON(),
        ...(requestId && { requestId }),
      },
      { status: error.statusCode }
    );
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return NextResponse.json(
      {
        error: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid request data',
        details,
        ...(requestId && { requestId }),
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, requestId);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error', {
      error: error.message,
      requestId,
    });

    return NextResponse.json(
      {
        error: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid data provided',
        ...(requestId && { requestId }),
      },
      { status: 400 }
    );
  }

  // Unknown error - log and return generic message
  logger.error('Unhandled error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    requestId,
  });

  return NextResponse.json(
    {
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      ...(requestId && { requestId }),
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors.
 *
 * Maps common Prisma error codes to user-friendly responses.
 * See: https://www.prisma.io/docs/reference/api-reference/error-reference
 *
 * @param error - Prisma error
 * @param requestId - Optional request ID
 * @returns NextResponse with appropriate error
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  requestId?: string
): NextResponse {
  const baseResponse = requestId ? { requestId } : {};

  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      // Extract field name from meta.target if available
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || 'field';

      return NextResponse.json(
        {
          error: ErrorCodes.CONFLICT,
          message: `A record with this ${field} already exists`,
          ...baseResponse,
        },
        { status: 409 }
      );
    }

    case 'P2025': {
      // Record not found (e.g., update/delete non-existent record)
      return NextResponse.json(
        {
          error: ErrorCodes.NOT_FOUND,
          message: 'Record not found',
          ...baseResponse,
        },
        { status: 404 }
      );
    }

    case 'P2003': {
      // Foreign key constraint failure
      const field = (error.meta?.field_name as string) || 'field';

      return NextResponse.json(
        {
          error: ErrorCodes.VALIDATION_ERROR,
          message: `Related record not found for ${field}`,
          ...baseResponse,
        },
        { status: 400 }
      );
    }

    case 'P2014': {
      // Required relation violation
      return NextResponse.json(
        {
          error: ErrorCodes.VALIDATION_ERROR,
          message: 'Cannot delete record with related data',
          ...baseResponse,
        },
        { status: 400 }
      );
    }

    case 'P2034': {
      // Transaction conflict
      return NextResponse.json(
        {
          error: ErrorCodes.CONFLICT,
          message: 'Transaction conflict, please retry',
          ...baseResponse,
        },
        { status: 409 }
      );
    }

    default: {
      // Unknown Prisma error - log and return generic database error
      logger.error('Prisma error', {
        code: error.code,
        message: error.message,
        meta: error.meta,
        requestId,
      });

      return NextResponse.json(
        {
          error: ErrorCodes.DATABASE_ERROR,
          message: 'A database error occurred',
          ...baseResponse,
        },
        { status: 500 }
      );
    }
  }
}
