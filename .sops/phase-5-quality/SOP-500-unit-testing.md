# SOP-500: Unit Testing

## Purpose

Establish unit testing standards to ensure individual functions, components, and modules work correctly in isolation. Unit tests provide fast feedback, document expected behavior, and prevent regressions.

---

## Scope

- **Applies to:** All code modules (functions, hooks, utilities, components)
- **Covers:** Test setup, patterns, mocking, coverage
- **Does not cover:** Integration testing (SOP-501), E2E testing, performance testing

---

## Prerequisites

- [ ] SOP-003 (Project Structure) — test folders established
- [ ] SOP-006 (Code Style) — coding standards defined
- [ ] Development environment set up

---

## Procedure

### 1. Install Testing Dependencies

```bash
# Core testing
pnpm add -D vitest @vitest/coverage-v8

# React testing
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# MSW for API mocking
pnpm add -D msw
```

### 2. Configure Vitest

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

### 3. Create Test Setup

```typescript
// tests/setup.ts

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### 4. Add Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 5. File Organization

```
src/
├── lib/
│   └── utils/
│       ├── format.ts
│       └── format.test.ts        # Co-located test
├── components/
│   └── ui/
│       └── Button/
│           ├── Button.tsx
│           └── Button.test.tsx   # Co-located test
tests/
├── setup.ts                       # Global setup
├── mocks/
│   ├── handlers.ts                # MSW handlers
│   └── server.ts                  # MSW server
└── fixtures/                      # Shared test data
    └── users.ts
```

### 6. Testing Pure Functions

```typescript
// src/lib/utils/format.ts

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
```

```typescript
// src/lib/utils/format.test.ts

import { describe, it, expect } from 'vitest';
import { formatCurrency, slugify, truncate } from './format';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('removes leading/trailing dashes', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('returns text unchanged if under limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});
```

### 7. Testing React Components

```typescript
// src/components/ui/Button/Button.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick} disabled>
        Click
      </Button>
    );
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('renders as different element with asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });
});
```

### 8. Testing Custom Hooks

```typescript
// src/hooks/useCounter.ts

import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

```typescript
// src/hooks/useCounter.test.ts

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('defaults to zero', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

### 9. Mocking Strategies

```typescript
// Mocking modules
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mocking implementations
import { prisma } from '@/lib/db';
vi.mocked(prisma.user.findUnique).mockResolvedValue({
  id: '1',
  name: 'Test',
  email: 'test@test.com',
});

// Spying on functions
const consoleSpy = vi.spyOn(console, 'log');
expect(consoleSpy).toHaveBeenCalledWith('message');

// Mocking timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();

// Mocking fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
});
```

### 10. Testing Async Code

```typescript
// src/lib/api/users.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUser, createUser } from './users';

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user by id', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'John' }),
    });

    const user = await getUser('1');

    expect(fetch).toHaveBeenCalledWith('/api/users/1');
    expect(user).toEqual({ id: '1', name: 'John' });
  });

  it('throws on fetch error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(getUser('999')).rejects.toThrow('User not found');
  });

  it('handles network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(getUser('1')).rejects.toThrow('Network error');
  });
});
```

### 11. Test Patterns Summary

```typescript
// tests/patterns.example.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Component/Function Name', () => {
  // Setup that runs before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Group related tests
  describe('when [condition]', () => {
    it('should [expected behavior]', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });

  // Test edge cases
  describe('edge cases', () => {
    it('handles empty input', () => {});
    it('handles null/undefined', () => {});
    it('handles maximum values', () => {});
  });

  // Test error cases
  describe('error handling', () => {
    it('throws on invalid input', () => {
      expect(() => fn(invalid)).toThrow();
    });
  });
});
```

---

## Review Checklist

- [ ] Testing framework configured
- [ ] Test setup file created
- [ ] Coverage thresholds set
- [ ] Test scripts in package.json
- [ ] Pure functions tested
- [ ] Components tested
- [ ] Hooks tested
- [ ] Mocking patterns established
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)

---

## AI Agent Prompt Template

```
Set up unit testing for this project.

Read:
- `package.json` for existing dependencies
- `src/` for code structure

Execute SOP-500 (Unit Testing):
1. Install Vitest and testing library
2. Create vitest.config.ts
3. Create tests/setup.ts
4. Add test scripts to package.json
5. Write example tests for existing utilities
6. Write example component tests
```

---

## Outputs

- [ ] `vitest.config.ts` — Test configuration
- [ ] `tests/setup.ts` — Global test setup
- [ ] `tests/mocks/` — MSW handlers and server
- [ ] `**/*.test.ts` — Unit test files
- [ ] Updated `package.json` with test scripts

---

## Related SOPs

- **SOP-501:** Integration Testing (testing with real dependencies)
- **SOP-502:** Code Review (reviewing test quality)
- **SOP-006:** Code Style Standards (test naming conventions)

---

## Coverage Guidelines

| Code Type      | Target Coverage | Priority |
| -------------- | --------------- | -------- |
| Utilities      | 90%+            | High     |
| Business logic | 80%+            | High     |
| Hooks          | 80%+            | High     |
| Components     | 70%+            | Medium   |
| API routes     | Via integration | Medium   |
| Config files   | Skip            | Low      |
