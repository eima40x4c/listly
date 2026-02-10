# SOP-302: API Integration

## Purpose

Establish consistent patterns for fetching, caching, and managing server data in frontend applications. Good API integration improves performance, provides better UX during loading states, and simplifies data management.

---

## Scope

- **Applies to:** All frontend data fetching operations
- **Covers:** Data fetching, caching, error handling, loading states
- **Does not cover:** API design (SOP-200), Authentication flow (SOP-201)

---

## Prerequisites

- [ ] SOP-200 (API Design) completed — API endpoints defined
- [ ] SOP-300 (Component Architecture) completed
- [ ] Backend API running

---

## Procedure

### 1. Choose Data Fetching Strategy

| Strategy               | Best For            | Framework          |
| ---------------------- | ------------------- | ------------------ |
| **Server Components**  | Static/SSR data     | Next.js App Router |
| **TanStack Query**     | Complex client-side | React, Next.js     |
| **SWR**                | Simple caching      | React, Next.js     |
| **fetch in useEffect** | Simple cases        | Any React          |

**Recommendation:** Use Server Components for initial load + TanStack Query for client-side mutations and refetching.

### 2. Install Dependencies

```bash
pnpm add @tanstack/react-query
```

### 3. Set Up Query Client

```typescript
// src/lib/query-client.ts

import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
```

### 4. Create Query Provider

```typescript
// src/components/providers/QueryProvider.tsx

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Add to layout:

```tsx
// src/app/layout.tsx

import { QueryProvider } from '@/components/providers/QueryProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

### 5. Create API Client

```typescript
// src/lib/api/client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public data: ApiError
  ) {
    super(data.message);
    this.name = 'ApiClientError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    }));
    throw new ApiClientError(response.status, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return handleResponse<T>(response);
  },

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return handleResponse<T>(response);
  },
};
```

### 6. Create Query Hooks

```typescript
// src/hooks/api/useProducts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  category: { id: string; name: string };
}

interface ProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}

// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hooks
export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.category) params.set('category', filters.category);
  if (filters.q) params.set('q', filters.q);

  const queryString = params.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => api.get<ProductsResponse>(endpoint),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.get<{ data: Product }>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'category'>) =>
      api.post<{ data: Product }>('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      api.patch<{ data: Product }>(`/products/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

### 7. Usage in Components

```tsx
// src/app/products/page.tsx (Server Component)

import { ProductList } from '@/components/features/products/ProductList';
import { Suspense } from 'react';
import { ProductListSkeleton } from '@/components/features/products/ProductListSkeleton';

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </div>
  );
}
```

```tsx
// src/components/features/products/ProductList.tsx (Client Component)

'use client';

import { useProducts } from '@/hooks/api/useProducts';
import { ProductCard } from './ProductCard';
import { ProductListSkeleton } from './ProductListSkeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface ProductListProps {
  category?: string;
}

export function ProductList({ category }: ProductListProps) {
  const { data, isLoading, error } = useProducts({ category });

  if (isLoading) return <ProductListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.data.length) return <p>No products found.</p>;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {data.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 8. Mutation with Optimistic Updates

```tsx
// src/components/features/cart/AddToCartButton.tsx

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/cart/items', { productId, quantity: 1 }),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update
      // queryClient.setQueryData(['cart'], (old) => {...});

      return { previousCart };
    },
    onError: (err, _, context) => {
      // Rollback on error
      queryClient.setQueryData(['cart'], context?.previousCart);
      toast.error('Failed to add to cart');
    },
    onSuccess: () => {
      toast.success('Added to cart!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return (
    <Button onClick={() => mutate()} isLoading={isPending}>
      Add to Cart
    </Button>
  );
}
```

### 9. Server-Side Fetching (Next.js)

```typescript
// src/lib/api/server.ts

import { cache } from 'react';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

export const getProducts = cache(async (filters?: Record<string, string>) => {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE_URL}/products?${params}`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
});

export const getProduct = cache(async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    next: { tags: [`product-${id}`] }, // For on-demand revalidation
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch product');
  }

  return res.json();
});
```

Usage in Server Component:

```tsx
// src/app/products/[id]/page.tsx

import { getProduct } from '@/lib/api/server';
import { notFound } from 'next/navigation';

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  return (
    <div>
      <h1>{product.data.name}</h1>
      <p>{product.data.description}</p>
    </div>
  );
}
```

### 10. Loading and Error States

```tsx
// src/components/ui/LoadingSkeleton.tsx

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

// Usage
export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
```

```tsx
// src/components/ui/ErrorMessage.tsx

import { ApiClientError } from '@/lib/api/client';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: Error;
  retry?: () => void;
}

export function ErrorMessage({ error, retry }: ErrorMessageProps) {
  const message =
    error instanceof ApiClientError
      ? error.data.message
      : 'Something went wrong';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 font-semibold">Error</h3>
      <p className="mb-4 text-muted-foreground">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
```

---

## Review Checklist

- [ ] Query client configured
- [ ] Query provider in layout
- [ ] API client with error handling
- [ ] Query hooks for each resource
- [ ] Query key factory pattern used
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Optimistic updates for mutations
- [ ] Cache invalidation on mutations
- [ ] Server-side fetching for SSR pages

---

## AI Agent Prompt Template

```
Set up API integration for this project.

Read:
- `/docs/api/endpoints.md` for API structure
- `/docs/tech-stack.md` for frontend framework

Execute SOP-302 (API Integration):
1. Install TanStack Query
2. Create query client configuration
3. Create API client with error handling
4. Create query hooks for main resources
5. Set up loading and error components
6. Configure server-side fetching if needed
```

---

## Outputs

- [ ] `src/lib/query-client.ts` — Query client config
- [ ] `src/components/providers/QueryProvider.tsx` — Provider
- [ ] `src/lib/api/client.ts` — API client
- [ ] `src/hooks/api/*.ts` — Query hooks
- [ ] `src/components/ui/Skeleton.tsx` — Loading skeleton
- [ ] `src/components/ui/ErrorMessage.tsx` — Error display

---

## Related SOPs

- **SOP-200:** API Design (endpoint contracts)
- **SOP-300:** Component Architecture (component patterns)
- **SOP-203:** Error Handling (API error format)
- **SOP-304:** Progressive Web App (offline caching) _(optional)_
