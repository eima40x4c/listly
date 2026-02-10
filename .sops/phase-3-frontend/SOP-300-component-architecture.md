# SOP-300: Component Architecture

## Purpose

Establish a consistent, scalable component architecture that promotes reusability, maintainability, and clear separation of concerns. Good component architecture makes the codebase easier to understand and extend.

---

## Scope

- **Applies to:** All frontend projects with component-based frameworks
- **Covers:** Component organization, patterns, props design, composition
- **Does not cover:** Styling (SOP-301), State management

---

## Prerequisites

- [ ] SOP-003 (Project Structure) completed
- [ ] SOP-005 (Design Patterns) completed
- [ ] UI framework selected (React, Vue, etc.)

---

## Procedure

### 1. Component Categories

Organize components by their role:

| Category               | Purpose                           | Example                             |
| ---------------------- | --------------------------------- | ----------------------------------- |
| **UI Components**      | Generic, reusable building blocks | Button, Input, Card, Modal          |
| **Layout Components**  | Page structure and positioning    | Header, Footer, Sidebar, Container  |
| **Feature Components** | Business logic components         | ProductCard, UserProfile, OrderList |
| **Page Components**    | Route-level containers            | HomePage, ProductPage, CheckoutPage |

### 2. Folder Structure

```
src/components/
├── ui/                     # Base UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   └── index.ts            # Barrel export
├── layout/                 # Layout components
│   ├── Header/
│   ├── Footer/
│   ├── Sidebar/
│   └── Container/
├── forms/                  # Form-related components
│   ├── FormField/
│   ├── Select/
│   └── Checkbox/
└── features/               # Feature-specific components
    ├── products/
    │   ├── ProductCard/
    │   ├── ProductGrid/
    │   └── ProductFilters/
    ├── cart/
    │   ├── CartItem/
    │   └── CartSummary/
    └── auth/
        ├── LoginForm/
        └── RegisterForm/
```

### 3. Component File Structure

Each component lives in its own folder:

```
Button/
├── Button.tsx          # Main component
├── Button.test.tsx     # Tests
├── Button.stories.tsx  # Storybook (optional)
├── Button.module.css   # Styles (if using CSS modules)
└── index.ts            # Export
```

```typescript
// Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### 4. Component Design Principles

#### Single Responsibility

Each component does one thing well.

```tsx
// ❌ Bad: Too many responsibilities
function UserCard({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  // Fetching, editing, displaying all in one
}

// ✅ Good: Single responsibility
function UserCard({ user, onEdit }) {
  return (
    <Card>
      <Avatar src={user.avatar} />
      <h3>{user.name}</h3>
      <Button onClick={() => onEdit(user.id)}>Edit</Button>
    </Card>
  );
}
```

#### Composition Over Props

Prefer composable children over many props.

```tsx
// ❌ Bad: Too many props
<Card
  title="Product"
  subtitle="Description"
  image="/product.jpg"
  footer={<Button>Buy</Button>}
  actions={[...]}
/>

// ✅ Good: Composable
<Card>
  <Card.Image src="/product.jpg" />
  <Card.Body>
    <Card.Title>Product</Card.Title>
    <Card.Text>Description</Card.Text>
  </Card.Body>
  <Card.Footer>
    <Button>Buy</Button>
  </Card.Footer>
</Card>
```

### 5. Props Design Patterns

#### Explicit Props Interface

```typescript
// src/components/ui/Button/Button.tsx

import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, size }),
          className
        )}
        {...props}
      >
        {isLoading ? <Spinner size={size} /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### Polymorphic Components (as prop)

```typescript
// Component that can render as different elements
interface BoxProps<T extends React.ElementType> {
  as?: T;
  children: React.ReactNode;
}

type BoxComponent = <T extends React.ElementType = 'div'>(
  props: BoxProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof BoxProps<T>>
) => React.ReactElement | null;

const Box: BoxComponent = ({ as, children, ...props }) => {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
};

// Usage
<Box>Default div</Box>
<Box as="section">As section</Box>
<Box as="a" href="/link">As link</Box>
```

### 6. UI Component Template

```typescript
// src/components/ui/Card/Card.tsx

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-card text-card-foreground',
          {
            'border': variant === 'default',
            'border-2': variant === 'outlined',
            'shadow-lg': variant === 'elevated',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Compound components
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
```

### 7. Feature Component Template

```typescript
// src/components/features/products/ProductCard/ProductCard.tsx

import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    category: { name: string };
  };
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative">
          <Image
            src={product.imageUrl || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">
          {product.category.name}
        </p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold hover:underline">{product.name}</h3>
        </Link>
        <p className="text-lg font-bold">{formatPrice(product.price)}</p>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onAddToCart?.(product.id)}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 8. Server vs Client Components (Next.js)

```typescript
// Server Component (default) - for static/data fetching
// src/components/features/products/ProductList/ProductList.tsx

import { prisma } from '@/lib/db';
import { ProductCard } from '../ProductCard';

export async function ProductList() {
  const products = await prisma.product.findMany({
    include: { category: true },
    take: 12,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Client Component - for interactivity
// src/components/features/products/ProductCard/AddToCartButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

export function AddToCartButton({ productId }: { productId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();

  const handleClick = async () => {
    setIsLoading(true);
    await addItem(productId);
    setIsLoading(false);
  };

  return (
    <Button onClick={handleClick} isLoading={isLoading}>
      Add to Cart
    </Button>
  );
}
```

### 9. Barrel Exports

Create index files for clean imports:

```typescript
// src/components/ui/index.ts
export { Button, type ButtonProps } from './Button';
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
export { Input, type InputProps } from './Input';
export { Modal } from './Modal';
// ...
```

**Usage:**

```typescript
import { Button, Card, Input } from '@/components/ui';
```

### 10. Document Component Library

Create `/docs/components/README.md`:

```markdown
# Component Library

## Overview

This project uses a component-based architecture with React.

## Component Categories

| Category | Location               | Purpose                  |
| -------- | ---------------------- | ------------------------ |
| UI       | `components/ui/`       | Reusable building blocks |
| Layout   | `components/layout/`   | Page structure           |
| Forms    | `components/forms/`    | Form inputs and fields   |
| Features | `components/features/` | Business logic           |

## Creating Components

1. Create folder: `components/ui/ComponentName/`
2. Add component file: `ComponentName.tsx`
3. Add barrel export: `index.ts`
4. Export from category index: `components/ui/index.ts`

## Naming Conventions

- Components: PascalCase (`ProductCard`)
- Props interfaces: `ComponentNameProps`
- Files: Match component name

## Server vs Client Components

- Default to Server Components
- Add `'use client'` only when needed (interactivity, hooks)
```

---

## Review Checklist

- [ ] Component folder structure created
- [ ] UI components use forwardRef
- [ ] Props interfaces are explicit and typed
- [ ] Components follow single responsibility
- [ ] Compound components for complex UI
- [ ] Barrel exports configured
- [ ] Server/client components separated correctly
- [ ] Component documentation exists

---

## AI Agent Prompt Template

```
Set up the component architecture for this project.

Read:
- `/docs/tech-stack.md` for framework
- `/docs/requirements.md` for features needed

Execute SOP-300 (Component Architecture):
1. Create component folder structure
2. Create base UI components (Button, Card, Input)
3. Create layout components (Header, Footer)
4. Set up barrel exports
5. Document component patterns
```

---

## Outputs

- [ ] `src/components/ui/` — Base UI components
- [ ] `src/components/layout/` — Layout components
- [ ] `src/components/forms/` — Form components
- [ ] `src/components/features/` — Feature components
- [ ] `src/components/ui/index.ts` — Barrel export
- [ ] `/docs/components/README.md` — Documentation

---

## Related SOPs

- **SOP-003:** Project Structure (folder organization)
- **SOP-301:** Styling Standards (component styling)
- **SOP-303:** Form Handling (form components)
- **SOP-304:** Progressive Web App (mobile UI components) _(optional)_
