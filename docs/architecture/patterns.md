# Design Patterns: Listly

## Overview

This document defines the architectural and code-level design patterns used throughout Listly. These patterns ensure consistency, maintainability, and scalability as the application grows.

---

## Architectural Pattern

### Selected: Modular Monolith

**Definition:** A single deployable application organized into loosely-coupled, feature-based modules with clear boundaries and dependencies.

**Rationale:**

| Factor                | Assessment                                                     | Impact on Decision                                                |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Team Size**         | Small (1-2 developers)                                         | ✅ Monolith enables rapid iteration without microservice overhead |
| **Time to Market**    | Critical (MVP launch in 12 weeks)                              | ✅ Single codebase, single deployment pipeline                    |
| **Scalability Needs** | Progressive (start small, scale up)                            | ✅ Vercel handles horizontal scaling automatically                |
| **Domain Complexity** | Moderate (distinct features: lists, pantry, AI, collaboration) | ✅ Module boundaries align with domain features                   |
| **DevOps Maturity**   | Managed services (Vercel, Supabase)                            | ✅ Platform abstracts infrastructure complexity                   |
| **Tech Stack**        | Next.js 14 App Router                                          | ✅ Native support for modular organization                        |

**Benefits:**

- **Simplified deployment:** Single build and deploy to Vercel
- **Faster development:** No inter-service communication complexity
- **Easier debugging:** Full stack trace within one application
- **Lower operational cost:** One application to monitor and maintain
- **Migration path:** Clear module boundaries enable future extraction to microservices if needed

**Trade-offs:**

- **Scaling limitations:** All features scale together (mitigated by Vercel's edge network)
- **Technology constraints:** Entire app uses same stack (acceptable for our use case)

---

## Application Layer Organization

### Feature-Based Architecture

**Structure:**

```
src/
├── app/                          # Next.js App Router (routing only)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   └── lists/[id]/page.tsx
│   └── api/                      # API routes
│       ├── lists/route.ts
│       └── auth/[...nextauth]/route.ts
│
├── features/                     # Domain features (business logic + UI)
│   ├── shopping-lists/
│   │   ├── components/           # Feature-specific components
│   │   │   ├── ShoppingList.tsx
│   │   │   ├── AddItemForm.tsx
│   │   │   └── ShoppingModeView.tsx
│   │   ├── hooks/                # Feature-specific hooks
│   │   │   ├── useShoppingList.ts
│   │   │   └── useListItems.ts
│   │   ├── services/             # Business logic
│   │   │   └── listService.ts
│   │   ├── types.ts              # Feature types
│   │   └── index.ts              # Public API
│   │
│   ├── pantry/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── collaboration/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── realtimeService.ts
│   │   └── types.ts
│   │
│   ├── ai-suggestions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── aiService.ts
│   │   └── types.ts
│   │
│   ├── budget/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   │
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
│
├── components/                   # Shared UI components
│   ├── ui/                       # Base components (shadcn/ui)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── forms/                    # Shared form components
│   │   └── FormField.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/                          # Shared utilities and infrastructure
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # NextAuth configuration
│   ├── utils.ts                  # Utility functions
│   ├── validations/              # Zod schemas
│   └── repositories/             # Data access layer
│       ├── base.repository.ts
│       ├── list.repository.ts
│       ├── item.repository.ts
│       └── user.repository.ts
│
├── hooks/                        # Shared React hooks
│   ├── useAuth.ts
│   ├── useToast.ts
│   └── useMediaQuery.ts
│
├── types/                        # Shared TypeScript types
│   ├── index.ts
│   └── api.ts
│
├── services/                     # Shared services
│   ├── storage.service.ts        # Supabase Storage
│   └── email.service.ts          # Resend email
│
└── config/                       # Configuration
    ├── site.ts                   # Site metadata
    └── navigation.ts             # Navigation structure
```

**Key Principles:**

1. **Feature Modules are Self-Contained:**
   - Each feature folder contains everything needed for that feature
   - Features export a clean public API via `index.ts`
   - Features can import from `lib/`, `components/`, and other features' public APIs

2. **Dependency Flow:**

   ```
   App Router Pages → Features → Lib/Shared
   ```

   - Pages orchestrate features
   - Features contain domain logic
   - Shared utilities support features

3. **Import Rules:**
   - ✅ Features can import from: `lib/`, `components/`, `hooks/`, `types/`, `config/`
   - ✅ Features can import from other features' public API (`features/X/index.ts`)
   - ❌ Features should not import internal files from other features
   - ❌ Circular dependencies between features are prohibited

---

## Core Design Patterns

### 1. Repository Pattern (Data Access Layer)

**Purpose:** Abstract database operations and provide a clean interface for data access.

**Location:** `src/lib/repositories/`

**Implementation:**

```typescript
// src/lib/repositories/base.repository.ts

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  create(data: CreateDTO<T>): Promise<T>;
  update(id: ID, data: UpdateDTO<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface FindOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
  include?: Record<string, boolean>;
}
```

```typescript
// src/lib/repositories/list.repository.ts

import { prisma } from '@/lib/db';
import type { ShoppingList, Prisma } from '@prisma/client';

export const listRepository = {
  async findById(id: string) {
    return prisma.shoppingList.findUnique({
      where: { id },
      include: {
        items: true,
        members: true,
        owner: true,
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.shoppingList.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        items: { where: { completed: false } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async create(data: Prisma.ShoppingListCreateInput) {
    return prisma.shoppingList.create({
      data,
      include: { items: true },
    });
  },

  async update(id: string, data: Prisma.ShoppingListUpdateInput) {
    return prisma.shoppingList.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await prisma.shoppingList.delete({ where: { id } });
  },

  async addMember(listId: string, userId: string) {
    return prisma.shoppingList.update({
      where: { id: listId },
      data: {
        members: {
          create: { userId },
        },
      },
    });
  },
};
```

**Benefits:**

- Centralized data access logic
- Easy to mock for testing
- Database implementation can change without affecting business logic
- Consistent query patterns across the application

---

### 2. Service Pattern (Business Logic Layer)

**Purpose:** Encapsulate business rules, orchestrate multiple repositories, handle complex operations.

**Location:** `src/features/[feature]/services/`

**Implementation:**

```typescript
// src/features/shopping-lists/services/listService.ts

import { listRepository } from '@/lib/repositories/list.repository';
import { itemRepository } from '@/lib/repositories/item.repository';
import { realtimeService } from '@/features/collaboration/services/realtimeService';
import { aiService } from '@/features/ai-suggestions/services/aiService';
import { ConflictError, NotFoundError } from '@/lib/errors';

export const listService = {
  /**
   * Create a new shopping list with optional initial items
   */
  async createList(userId: string, data: CreateListDTO) {
    // Validate user permissions
    if (!userId) {
      throw new UnauthorizedError('User must be authenticated');
    }

    // Create list
    const list = await listRepository.create({
      name: data.name,
      ownerId: userId,
      budget: data.budget,
    });

    // Add initial items if provided
    if (data.items && data.items.length > 0) {
      await itemRepository.createMany(
        data.items.map((item) => ({
          ...item,
          listId: list.id,
          addedBy: userId,
        }))
      );
    }

    // Broadcast to collaborators
    await realtimeService.broadcastListCreated(list.id, userId);

    return list;
  },

  /**
   * Add item to list with AI categorization
   */
  async addItem(listId: string, userId: string, data: AddItemDTO) {
    // Check list exists and user has access
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError('Shopping list not found');
    }

    // AI-powered category suggestion
    const category =
      data.category || (await aiService.categorizeItem(data.name));

    // Create item
    const item = await itemRepository.create({
      listId,
      name: data.name,
      quantity: data.quantity || 1,
      category,
      addedBy: userId,
    });

    // Get AI suggestions for complementary items
    const suggestions = await aiService.getSuggestions(listId, item.name);

    // Broadcast real-time update
    await realtimeService.broadcastItemAdded(listId, item, userId);

    return {
      item,
      suggestions,
    };
  },

  /**
   * Share list with another user
   */
  async shareList(listId: string, ownerId: string, inviteeEmail: string) {
    // Verify ownership
    const list = await listRepository.findById(listId);
    if (!list || list.ownerId !== ownerId) {
      throw new UnauthorizedError('Only the list owner can share');
    }

    // Find invitee by email
    const invitee = await userRepository.findByEmail(inviteeEmail);
    if (!invitee) {
      throw new NotFoundError('User not found');
    }

    // Check if already a member
    if (list.members.some((m) => m.userId === invitee.id)) {
      throw new ConflictError('User is already a member');
    }

    // Add member
    await listRepository.addMember(listId, invitee.id);

    // Send invitation email
    await emailService.sendListInvitation(invitee.email, list.name, ownerId);

    // Notify via real-time
    await realtimeService.broadcastMemberAdded(listId, invitee.id);

    return { success: true };
  },

  /**
   * Complete shopping trip and record history
   */
  async completeShoppingTrip(
    listId: string,
    userId: string,
    data: CompleteShoppingDTO
  ) {
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Mark all completed items
    await itemRepository.markCompleted(listId, data.completedItemIds);

    // Record price history
    if (data.prices && data.prices.length > 0) {
      await priceHistoryRepository.recordPrices(data.prices);
    }

    // Update budget tracking
    const totalSpent = data.prices.reduce((sum, p) => sum + p.price, 0);
    await budgetRepository.recordExpense(userId, listId, totalSpent);

    // Transfer purchased items to pantry if enabled
    if (data.addToPantry) {
      await pantryService.addItemsFromList(
        userId,
        listId,
        data.completedItemIds
      );
    }

    // Archive or clear list based on user preference
    if (data.archiveList) {
      await listRepository.archive(listId);
    } else {
      await itemRepository.deleteCompleted(listId);
    }

    return { success: true, totalSpent };
  },
};
```

**Benefits:**

- Business logic is centralized and testable
- Multiple repository operations are coordinated
- Complex workflows are encapsulated
- Easy to understand high-level operations

---

### 3. Custom Hooks Pattern (React State & Side Effects)

**Purpose:** Encapsulate stateful logic, API calls, and side effects in reusable hooks.

**Location:** `src/features/[feature]/hooks/` or `src/hooks/` (if shared)

**Implementation:**

```typescript
// src/features/shopping-lists/hooks/useShoppingList.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export function useShoppingList(listId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch list data
  const {
    data: list,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['shopping-list', listId],
    queryFn: () => fetch(`/api/lists/${listId}`).then((res) => res.json()),
    enabled: !!listId,
  });

  // Add item mutation
  const addItem = useMutation({
    mutationFn: (data: AddItemDTO) =>
      fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
      toast({ title: 'Item added', description: data.item.name });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check off item mutation
  const toggleItem = useMutation({
    mutationFn: (itemId: string) =>
      fetch(`/api/lists/${listId}/items/${itemId}/toggle`, { method: 'PATCH' }),
    onMutate: async (itemId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['shopping-list', listId] });
      const previous = queryClient.getQueryData(['shopping-list', listId]);

      queryClient.setQueryData(['shopping-list', listId], (old: any) => ({
        ...old,
        items: old.items.map((item: any) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      }));

      return { previous };
    },
    onError: (err, itemId, context) => {
      // Rollback on error
      queryClient.setQueryData(['shopping-list', listId], context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    },
  });

  return {
    list,
    isLoading,
    error,
    addItem: addItem.mutate,
    toggleItem: toggleItem.mutate,
    isAddingItem: addItem.isPending,
  };
}
```

```typescript
// src/features/collaboration/hooks/useRealtimeList.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '@/features/collaboration/services/realtimeService';

export function useRealtimeList(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;

    // Subscribe to real-time updates
    const channel = realtimeService.subscribeToList(listId, {
      onItemAdded: (item) => {
        queryClient.setQueryData(['shopping-list', listId], (old: any) => ({
          ...old,
          items: [...old.items, item],
        }));
      },
      onItemUpdated: (item) => {
        queryClient.setQueryData(['shopping-list', listId], (old: any) => ({
          ...old,
          items: old.items.map((i: any) => (i.id === item.id ? item : i)),
        }));
      },
      onItemDeleted: (itemId) => {
        queryClient.setQueryData(['shopping-list', listId], (old: any) => ({
          ...old,
          items: old.items.filter((i: any) => i.id !== itemId),
        }));
      },
    });

    // Cleanup subscription
    return () => {
      realtimeService.unsubscribe(channel);
    };
  }, [listId, queryClient]);
}
```

**Benefits:**

- Logic is reusable across components
- Components remain focused on rendering
- Side effects are properly managed
- Easy to test hooks in isolation

---

### 4. React Component Patterns

#### Container/Presenter Pattern

**Purpose:** Separate data fetching/logic (Container) from UI rendering (Presenter).

**When to use:** Complex components with significant logic, components with multiple data sources.

```typescript
// Container (logic + data fetching)
// src/features/shopping-lists/components/ShoppingListContainer.tsx

export function ShoppingListContainer({ listId }: { listId: string }) {
  const { list, isLoading, error, addItem, toggleItem } = useShoppingList(listId);
  useRealtimeList(listId); // Real-time updates

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!list) return <NotFound message="List not found" />;

  return (
    <ShoppingListPresenter
      list={list}
      onAddItem={addItem}
      onToggleItem={toggleItem}
    />
  );
}

// Presenter (pure UI)
// src/features/shopping-lists/components/ShoppingListPresenter.tsx

interface ShoppingListPresenterProps {
  list: ShoppingList;
  onAddItem: (data: AddItemDTO) => void;
  onToggleItem: (itemId: string) => void;
}

export function ShoppingListPresenter({ list, onAddItem, onToggleItem }: ShoppingListPresenterProps) {
  return (
    <Card>
      <Card.Header>
        <h2>{list.name}</h2>
        {list.budget && <BudgetProgress budget={list.budget} spent={list.totalSpent} />}
      </Card.Header>
      <Card.Body>
        <AddItemForm onSubmit={onAddItem} />
        <ItemList items={list.items} onToggle={onToggleItem} />
      </Card.Body>
    </Card>
  );
}
```

#### Compound Components Pattern

**Purpose:** Create flexible, composable component APIs with shared context.

**When to use:** UI components with multiple sub-parts (Cards, Modals, Tabs).

```typescript
// src/components/ui/Card/Card.tsx

const CardContext = createContext<{ variant?: string }>({});

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={cn('card', `card-${variant}`, className)}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('card-header', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('card-body', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('card-footer', className)}>{children}</div>;
}

// Export as namespace
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card variant="elevated">
  <Card.Header>
    <h3>Shopping List</h3>
  </Card.Header>
  <Card.Body>
    <ItemList items={items} />
  </Card.Body>
  <Card.Footer>
    <Button>Add Item</Button>
  </Card.Footer>
</Card>
```

#### Render Props Pattern

**Purpose:** Share code between components using a prop whose value is a function.

**When to use:** Need to customize rendering while sharing logic (e.g., data fetching, animations).

```typescript
// src/components/DataLoader.tsx

interface DataLoaderProps<T> {
  url: string;
  children: (data: T, reload: () => void) => React.ReactNode;
}

export function DataLoader<T>({ url, children }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const response = await fetch(url);
    const result = await response.json();
    setData(result);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [url]);

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;

  return <>{children(data, load)}</>;
}

// Usage
<DataLoader<ShoppingList[]> url="/api/lists">
  {(lists, reload) => (
    <>
      <button onClick={reload}>Refresh</button>
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </>
  )}
</DataLoader>
```

---

## Additional Patterns

### Factory Pattern (Object Creation)

**Purpose:** Create objects based on input parameters without exposing creation logic.

**Use case:** Notification system (email, push, SMS), payment methods.

```typescript
// src/lib/notifications/factory.ts

interface Notification {
  send(userId: string, message: string, data?: any): Promise<void>;
}

class EmailNotification implements Notification {
  async send(userId: string, message: string, data?: any) {
    const user = await userRepository.findById(userId);
    await emailService.send({
      to: user.email,
      subject: data?.subject || 'Notification',
      body: message,
    });
  }
}

class PushNotification implements Notification {
  async send(userId: string, message: string, data?: any) {
    const tokens = await pushTokenRepository.findByUserId(userId);
    await pushService.sendToTokens(tokens, message, data);
  }
}

export function createNotification(type: 'email' | 'push'): Notification {
  switch (type) {
    case 'email':
      return new EmailNotification();
    case 'push':
      return new PushNotification();
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

// Usage
const notification = createNotification('push');
await notification.send(userId, 'Your shopping list was shared!');
```

### Strategy Pattern (Interchangeable Algorithms)

**Purpose:** Define a family of algorithms, encapsulate each one, and make them interchangeable.

**Use case:** AI suggestion algorithms, price comparison algorithms.

```typescript
// src/features/ai-suggestions/strategies/suggestionStrategy.ts

interface SuggestionStrategy {
  getSuggestions(userId: string, listId: string): Promise<SuggestedItem[]>;
}

class FrequencyBasedStrategy implements SuggestionStrategy {
  async getSuggestions(userId: string, listId: string) {
    // Suggest items user buys frequently
    const history = await purchaseHistoryRepository.findByUser(userId);
    return analyzeFrequency(history);
  }
}

class ComplementaryItemsStrategy implements SuggestionStrategy {
  async getSuggestions(userId: string, listId: string) {
    // Suggest items that go well with current list
    const list = await listRepository.findById(listId);
    return await aiService.getComplementaryItems(list.items);
  }
}

class SeasonalStrategy implements SuggestionStrategy {
  async getSuggestions(userId: string, listId: string) {
    // Suggest seasonal items
    const season = getCurrentSeason();
    return await productRepository.findBySeasonality(season);
  }
}

// Context that uses strategy
export class SuggestionEngine {
  constructor(private strategy: SuggestionStrategy) {}

  setStrategy(strategy: SuggestionStrategy) {
    this.strategy = strategy;
  }

  async generateSuggestions(userId: string, listId: string) {
    return this.strategy.getSuggestions(userId, listId);
  }
}

// Usage
const engine = new SuggestionEngine(new FrequencyBasedStrategy());
const suggestions = await engine.generateSuggestions(userId, listId);

// Switch strategy dynamically
engine.setStrategy(new SeasonalStrategy());
const seasonalSuggestions = await engine.generateSuggestions(userId, listId);
```

---

## Error Handling Patterns

### Custom Error Classes

```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}
```

### API Route Error Handler

```typescript
// src/app/api/error-handler.ts

import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      // Log unexpected errors
      console.error('Unexpected error:', error);

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Usage
export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get('id');

  if (!listId) {
    throw new ValidationError('List ID is required');
  }

  const list = await listRepository.findById(listId);
  if (!list) {
    throw new NotFoundError('Shopping list not found');
  }

  return NextResponse.json(list);
});
```

---

## Testing Patterns

### Repository Testing (with Mocked Prisma)

```typescript
// src/lib/repositories/__tests__/list.repository.test.ts

import { listRepository } from '../list.repository';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  prisma: {
    shoppingList: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('listRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find list by ID', async () => {
    const mockList = { id: '1', name: 'Groceries', ownerId: 'user-1' };
    (prisma.shoppingList.findUnique as jest.Mock).mockResolvedValue(mockList);

    const result = await listRepository.findById('1');

    expect(result).toEqual(mockList);
    expect(prisma.shoppingList.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: expect.any(Object),
    });
  });
});
```

### Service Testing (with Mocked Repositories)

```typescript
// src/features/shopping-lists/services/__tests__/listService.test.ts

import { listService } from '../listService';
import { listRepository } from '@/lib/repositories/list.repository';

jest.mock('@/lib/repositories/list.repository');

describe('listService.createList', () => {
  it('should create list and broadcast to collaborators', async () => {
    const mockList = { id: '1', name: 'Groceries', ownerId: 'user-1' };
    (listRepository.create as jest.Mock).mockResolvedValue(mockList);

    const result = await listService.createList('user-1', {
      name: 'Groceries',
      budget: 100,
    });

    expect(result).toEqual(mockList);
    expect(listRepository.create).toHaveBeenCalledWith({
      name: 'Groceries',
      ownerId: 'user-1',
      budget: 100,
    });
  });
});
```

---

## Summary

| Pattern Category      | Patterns Used                                          | Primary Location                                 |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| **Architectural**     | Modular Monolith                                       | Entire application                               |
| **Application Layer** | Feature-Based Organization                             | `src/features/`                                  |
| **Data Access**       | Repository Pattern                                     | `src/lib/repositories/`                          |
| **Business Logic**    | Service Pattern                                        | `src/features/*/services/`                       |
| **React State**       | Custom Hooks                                           | `src/hooks/`, `src/features/*/hooks/`            |
| **React Components**  | Container/Presenter, Compound Components, Render Props | `src/components/`, `src/features/*/components/`  |
| **Object Creation**   | Factory Pattern                                        | `src/lib/notifications/`, `src/lib/*/factory.ts` |
| **Algorithms**        | Strategy Pattern                                       | `src/features/ai-suggestions/strategies/`        |
| **Error Handling**    | Custom Error Classes                                   | `src/lib/errors.ts`                              |

---

## Pattern Selection Guidelines

**When to use Repository Pattern:**

- ✅ Any database access
- ✅ Need to abstract data source
- ✅ Want testable data layer

**When to use Service Pattern:**

- ✅ Business logic spans multiple repositories
- ✅ Complex workflows (e.g., complete shopping trip)
- ✅ Need to coordinate external services (email, real-time, AI)

**When to use Custom Hooks:**

- ✅ Stateful logic used in multiple components
- ✅ API calls with React Query
- ✅ Side effects (subscriptions, event listeners)

**When to use Container/Presenter:**

- ✅ Component has significant data fetching logic
- ✅ Want to test UI independently of data
- ✅ Component is complex and benefits from separation

**When to use Compound Components:**

- ✅ Building flexible UI components
- ✅ Sub-components need shared context
- ✅ Want intuitive component API (e.g., `<Card.Header>`)

**When to use Factory Pattern:**

- ✅ Object creation logic is complex
- ✅ Need to create different types based on input
- ✅ Want to hide instantiation details

**When to use Strategy Pattern:**

- ✅ Multiple algorithms for same task
- ✅ Need to switch algorithms at runtime
- ✅ Want to avoid large conditional statements

---

## Anti-Patterns to Avoid

❌ **God Components:** Components that do too much (fetch data, manage state, render complex UI)  
✅ **Solution:** Split into Container/Presenter or extract custom hooks

❌ **Prop Drilling:** Passing props through many layers  
✅ **Solution:** Use React Context, Zustand, or Compound Components

❌ **Business Logic in Components:** Complex calculations or API calls in component files  
✅ **Solution:** Move to services or custom hooks

❌ **Direct Prisma Calls in API Routes:** `prisma.user.create()` directly in route handlers  
✅ **Solution:** Always use repository layer

❌ **Monolithic Services:** One `shoppingService.ts` with 50 methods  
✅ **Solution:** Split by subdomain (e.g., `listService`, `itemService`, `collaborationService`)

❌ **Circular Dependencies:** Feature A imports from Feature B which imports from Feature A  
✅ **Solution:** Extract shared code to `lib/` or use public APIs only

---

## Next Steps

After patterns are established:

1. **SOP-006:** Define code style standards and linting rules
2. **SOP-007:** Set up testing framework aligned with patterns
3. **SOP-101:** Implement database schema (using Repository pattern)
4. **SOP-201:** Build feature modules following established patterns

---

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Design Patterns](https://www.patterns.dev/posts/react-patterns)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
