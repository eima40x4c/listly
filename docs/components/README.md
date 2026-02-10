# Component Library

## Overview

Listly uses a component-based architecture with React and Next.js 14. Components are organized by category and follow consistent patterns for props, styling, and composition.

---

## Component Categories

| Category | Location               | Purpose                                     |
| -------- | ---------------------- | ------------------------------------------- |
| UI       | `components/ui/`       | Generic, reusable building blocks           |
| Layout   | `components/layout/`   | Page structure and positioning              |
| Forms    | `components/forms/`    | Form inputs and field wrappers              |
| Features | `components/features/` | Business logic components (domain-specific) |

---

## Component Organization

Each component lives in its own folder with the following structure:

```
ComponentName/
├── ComponentName.tsx    # Main component
├── index.ts            # Export
```

**Example:**

```
Button/
├── Button.tsx
└── index.ts
```

---

## Naming Conventions

- **Components:** PascalCase (`Button`, `ShoppingListCard`)
- **Props interfaces:** `ComponentNameProps`
- **Files:** Match component name exactly
- **Folders:** Match component name exactly

---

## Import Pattern

Components are exported through barrel exports for clean imports:

```tsx
// ✅ Good - Import from category barrel
import { Button, Card, Input } from '@/components/ui';
import { Header, Footer } from '@/components/layout';
import { FormField, Select } from '@/components/forms';

// ❌ Avoid - Direct component imports
import { Button } from '@/components/ui/Button/Button';
```

---

## UI Components

### Button

Versatile button component with multiple variants, sizes, and loading states.

**Variants:** `primary`, `secondary`, `danger`, `outline`, `ghost`, `link`  
**Sizes:** `sm`, `md`, `lg`, `icon`

```tsx
import { Button } from '@/components/ui';

<Button>Click me</Button>
<Button variant="secondary" size="lg">Large Secondary</Button>
<Button isLoading>Loading...</Button>
<Button leftIcon={<PlusIcon />}>Add Item</Button>
<Button fullWidth>Full Width Button</Button>
```

### Card

Flexible card component with compound components for header, title, content, and footer.

**Variants:** `default`, `outlined`, `elevated`, `ghost`

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Shopping List</CardTitle>
    <CardDescription>Your weekly groceries</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Input

Styled input component with label, error, and helper text support.

**Sizes:** `sm`, `md`, `lg`  
**Variants:** `default`, `error`

```tsx
import { Input } from '@/components/ui';

<Input placeholder="Enter your name" />
<Input label="Email" type="email" required />
<Input error="This field is required" variant="error" />
<Input helperText="Must be at least 8 characters" />
```

### Label

Accessible label component for form inputs.

```tsx
import { Label } from '@/components/ui';

<Label htmlFor="email">Email Address</Label>
<Label required>Required Field</Label>
```

### Spinner

Loading spinner component.

**Sizes:** `sm`, `md`, `lg`, `xl`

```tsx
import { Spinner } from '@/components/ui';

<Spinner />
<Spinner size="lg" />
<Spinner className="text-primary" />
```

### Badge

Badge component for labels, tags, and status indicators.

**Variants:** `default`, `secondary`, `success`, `warning`, `danger`, `outline`

```tsx
import { Badge } from '@/components/ui';

<Badge>New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="outline">Draft</Badge>
```

### Avatar

User avatar component with image and fallback support.

**Sizes:** `sm`, `md`, `lg`, `xl`

```tsx
import { Avatar } from '@/components/ui';

<Avatar src="/avatar.jpg" alt="John Doe" />
<Avatar fallback="JD" />
<Avatar src="/avatar.jpg" alt="Jane Smith" size="lg" />
```

### Checkbox

Checkbox input component with label and error support.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox label="Accept terms and conditions" />
<Checkbox checked onChange={handleChange} />
<Checkbox error="This field is required" />
```

---

## Layout Components

### Container

Responsive container component for page layouts. Centers content and applies max-width constraints.

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`

```tsx
import { Container } from '@/components/layout';

<Container>
  <h1>Page Content</h1>
</Container>
<Container size="sm">Narrow content</Container>
```

### Header

Application header with navigation, user menu, and mobile support.

```tsx
import { Header } from '@/components/layout';

<Header user={session?.user} />;
```

### Footer

Application footer with links and copyright information.

```tsx
import { Footer } from '@/components/layout';

<Footer />;
```

---

## Form Components

### FormField

Form field wrapper that integrates with React Hook Form. Provides consistent error handling and labeling.

```tsx
import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';

<FormField label="Email" name="email" error={errors.email?.message} required>
  <Input {...register('email')} />
</FormField>;
```

### Select

Styled select dropdown component with label and error support.

**Sizes:** `sm`, `md`, `lg`  
**Variants:** `default`, `error`

```tsx
import { Select } from '@/components/forms';

<Select
  label="Category"
  options={[
    { value: 'produce', label: 'Produce' },
    { value: 'dairy', label: 'Dairy' }
  ]}
/>

<Select label="Choose one" required>
  <option value="">Select...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

### Textarea

Styled textarea component with label, error, and character count support.

**Variants:** `default`, `error`

```tsx
import { Textarea } from '@/components/forms';

<Textarea label="Description" rows={4} />
<Textarea showCount maxLength={500} />
<Textarea error="This field is required" />
```

---

## Server vs Client Components

Listly uses Next.js 14 App Router with Server Components by default.

### Server Components (Default)

- **Use for:** Static content, data fetching, SEO
- **No need to mark:** Server components are the default
- **Benefits:** Smaller bundle size, faster initial load

```tsx
// app/lists/page.tsx - Server Component
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui';

export default async function ListsPage() {
  const lists = await prisma.shoppingList.findMany();

  return (
    <div>
      {lists.map((list) => (
        <Card key={list.id}>...</Card>
      ))}
    </div>
  );
}
```

### Client Components

- **Use for:** Interactivity, hooks, event handlers, browser APIs
- **Mark with:** `'use client'` directive at the top
- **Minimize usage:** Keep client components small and focused

```tsx
// components/features/shopping-lists/AddItemButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export function AddItemButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // ... logic
    setIsLoading(false);
  };

  return (
    <Button onClick={handleClick} isLoading={isLoading}>
      Add Item
    </Button>
  );
}
```

---

## Creating New Components

### 1. Choose the Right Category

- **UI:** Generic, reusable (Button, Input, Card)
- **Layout:** Page structure (Header, Footer, Sidebar)
- **Forms:** Form-specific (FormField, Select, Textarea)
- **Features:** Domain-specific (ShoppingListCard, PantryItem)

### 2. Create Component Folder

```bash
mkdir -p src/components/ui/NewComponent
```

### 3. Create Component File

```tsx
// src/components/ui/NewComponent/NewComponent.tsx
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface NewComponentProps extends HTMLAttributes<HTMLDivElement> {
  // Props here
}

export const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-styles', className)} {...props} />
    );
  }
);

NewComponent.displayName = 'NewComponent';
```

### 4. Create Barrel Export

```tsx
// src/components/ui/NewComponent/index.ts
export { NewComponent, type NewComponentProps } from './NewComponent';
```

### 5. Update Category Barrel Export

```tsx
// src/components/ui/index.ts
export { NewComponent, type NewComponentProps } from './NewComponent';
```

---

## Component Design Principles

### Single Responsibility

Each component does one thing well.

```tsx
// ✅ Good - Single responsibility
function ShoppingListCard({ list }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{list.name}</CardTitle>
      </CardHeader>
      <CardContent>{list.itemCount} items</CardContent>
    </Card>
  );
}
```

### Composition Over Props

Prefer composable children over many props.

```tsx
// ✅ Good - Composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid - Too many props
<Card title="Title" content="Content" />
```

### Explicit Props

Use TypeScript interfaces for clear prop definitions.

```tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

### Forward Refs

Use `forwardRef` for components that need ref access.

```tsx
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn('...', className)} {...props} />;
  }
);
```

---

## Styling

Components use Tailwind CSS with the `cn()` utility for class merging:

```tsx
import { cn } from '@/lib/utils';

<div
  className={cn('base-classes', conditionalClass && 'added-class', className)}
/>;
```

### Class Variance Authority (CVA)

For components with multiple variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'base-classes', // Base classes
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-black',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

---

## Best Practices

1. **Use TypeScript** — All components should be typed
2. **ForwardRef** — Use for components that wrap native elements
3. **DisplayName** — Set for better debugging
4. **Accessibility** — Use semantic HTML and ARIA attributes
5. **Mobile-first** — Design for mobile, enhance for desktop
6. **Server Components** — Default to server, use client only when needed
7. **Barrel Exports** — Keep imports clean and organized
8. **Document Props** — JSDoc comments for complex components

---

## Related Documentation

- [Project Structure](/docs/architecture/project-structure.md)
- [Design Patterns](/docs/architecture/patterns.md)
- [Tech Stack](/docs/tech-stack.md)
