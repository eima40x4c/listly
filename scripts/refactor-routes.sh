#!/bin/bash
# Phase 1: Refactor all remaining routes with proper validation and error handling

# Lists [id] route
cat > /home/eima40x4c/Projects/listly/src/app/api/v1/lists/[id]/route.ts << 'EOF'
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/auth/api';
import { handleError } from '@/lib/errors/handler';
import { validateBody } from '@/lib/validation/validate';
import { updateShoppingListSchema } from '@/lib/validation/schemas/shopping-list';
import { ListService } from '@/services/list.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]
 * Get a specific list by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withAuth(_request, async (_req, user) => {
    try {
      const { id } = await params;
      const { searchParams } = new URL(_req.url);
      const include = searchParams.get('include')?.split(',') || [];

      const listService = new ListService();
      const result =
        include.length > 0
          ? await listService.getByIdWithDetails(id, user.id)
          : await listService.getById(id, user.id);

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: 'List not found' },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}

/**
 * PATCH /api/v1/lists/[id]
 * Update a specific list
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params;

      // Validate request body
      const validation = await validateBody(req, updateShoppingListSchema);
      if (!validation.success) return validation.error;

      const listService = new ListService();
      const result = await listService.update(id, user.id, validation.data);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}

/**
 * DELETE /api/v1/lists/[id]
 * Delete a specific list
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withAuth(_request, async (_req, user) => {
    try {
      const { id } = await params;

      const listService = new ListService();
      await listService.delete(id, user.id);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleError(error);
    }
  });
}
EOF

# Lists [id]/items route
cat > /home/eima40x4c/Projects/listly/src/app/api/v1/lists/[id]/items/route.ts << 'EOF'
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/auth/api';
import { handleError } from '@/lib/errors/handler';
import { validateBody } from '@/lib/validation/validate';
import { createListItemSchema } from '@/lib/validation/schemas/list-item';
import { ItemService } from '@/services/item.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/lists/[id]/items
 * Get all items in a list
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, user) => {
    try {
      const { id: listId } = await params;
      const { searchParams } = new URL(req.url);
      const isChecked = searchParams.get('isChecked');

      const itemService = new ItemService();
      // Service signature: getByList(listId, userId, includeChecked)
      // When isChecked param is 'false', we want includeChecked=false (hide checked items)
      // When isChecked is 'true' or null, we want includeChecked=true (show all)
      const includeChecked = isChecked !== 'false';
      const result = await itemService.getByList(
        listId,
        user.id,
        includeChecked
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}

/**
 * POST /api/v1/lists/[id]/items
 * Add a new item to the list
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, user) => {
    try {
      const { id: listId } = await params;

      // Validate request body
      const validation = await validateBody(req, createListItemSchema);
      if (!validation.success) return validation.error;

      const data = validation.data;

      const itemService = new ItemService();
      const result = await itemService.create({
        listId,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        categoryId: data.categoryId,
        estimatedPrice: data.estimatedPrice,
        notes: data.notes,
        priority: data.priority,
        addedById: user.id,
      });

      return NextResponse.json(
        {
          success: true,
          data: result,
        },
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  });
}
EOF

# Items [itemId] route
cat > /home/eima40x4c/Projects/listly/src/app/api/v1/items/[itemId]/route.ts << 'EOF'
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/auth/api';
import { handleError } from '@/lib/errors/handler';
import { validateBody } from '@/lib/validation/validate';
import { updateListItemSchema } from '@/lib/validation/schemas/list-item';
import { ItemService } from '@/services/item.service';

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

/**
 * PATCH /api/v1/items/[itemId]
 * Update an item
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, user) => {
    try {
      const { itemId } = await params;

      // Validate request body
      const validation = await validateBody(req, updateListItemSchema);
      if (!validation.success) return validation.error;

      const itemService = new ItemService();
      const result = await itemService.update(itemId, user.id, validation.data);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}

/**
 * DELETE /api/v1/items/[itemId]
 * Delete an item
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withAuth(_request, async (_req, user) => {
    try {
      const { itemId } = await params;

      const itemService = new ItemService();
      await itemService.delete(itemId, user.id);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleError(error);
    }
  });
}
EOF

# Stores route
cat > /home/eima40x4c/Projects/listly/src/app/api/v1/stores/route.ts << 'EOF'
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/auth/api';
import { handleError } from '@/lib/errors/handler';
import { StoreService } from '@/services/store.service';

/**
 * GET /api/v1/stores
 * Get all stores
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, _user) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
      const search = searchParams.get('search') || undefined;

      const storeService = new StoreService();
      const result = await storeService.getAll({
        page,
        limit,
        search,
      });

      return NextResponse.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}
EOF

echo "✅ All routes refactored with proper validation and error handling!"
