# Styling Standards

## Overview

This document defines the styling standards and best practices for the Listly application. We use Tailwind CSS for utility-first styling with custom theme configuration for consistent design tokens.

**Last Updated:** February 10, 2026  
**Status:** ✅ Implemented

---

## Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Theme Configuration](#theme-configuration)
- [Design Tokens](#design-tokens)
- [Component Styling](#component-styling)
- [Responsive Design](#responsive-design)
- [Typography](#typography)
- [Dark Mode](#dark-mode)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

---

## Architecture

### Styling Approach

**Utility-First CSS:** We use Tailwind CSS as our primary styling solution, leveraging utility classes for rapid development and consistent styling.

**Component Variants:** We use `class-variance-authority` (CVA) to manage component variants in a type-safe, scalable way.

**CSS Variables:** Theme colors are defined using CSS custom properties for easy theme switching and dark mode support.

**Utility Functions:** The `cn()` utility merges Tailwind classes intelligently, handling conflicts and conditional classes.

---

## Technology Stack

| Technology                         | Purpose                      |
| ---------------------------------- | ---------------------------- |
| **Tailwind CSS**                   | Utility-first CSS framework  |
| **class-variance-authority (CVA)** | Component variant management |
| **clsx**                           | Conditional class names      |
| **tailwind-merge**                 | Merge Tailwind classes       |
| **next-themes**                    | Dark mode support            |
| **@tailwindcss/forms**             | Form input styling           |
| **@tailwindcss/typography**        | Rich text styling            |

---

## Theme Configuration

### Tailwind Config

Our Tailwind configuration ([tailwind.config.ts](../tailwind.config.ts)) extends the default theme with:

- **Custom colors** using CSS variables
- **Custom border radius** variables
- **Font families** with CSS variables
- **Custom animations** for UI feedback
- **Plugins** for forms and typography

### Color System

All colors use HSL format with CSS variables for easy theme switching:

```typescript
colors: {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  // ... more colors
}
```

---

## Design Tokens

### Colors

#### Semantic Colors

| Token                    | CSS Variable                         | Usage                          |
| ------------------------ | ------------------------------------ | ------------------------------ |
| `background`             | `hsl(var(--background))`             | Page background                |
| `foreground`             | `hsl(var(--foreground))`             | Primary text                   |
| `primary`                | `hsl(var(--primary))`                | Primary actions, brand color   |
| `primary-foreground`     | `hsl(var(--primary-foreground))`     | Text on primary background     |
| `secondary`              | `hsl(var(--secondary))`              | Secondary actions              |
| `secondary-foreground`   | `hsl(var(--secondary-foreground))`   | Text on secondary background   |
| `destructive`            | `hsl(var(--destructive))`            | Danger, delete actions         |
| `destructive-foreground` | `hsl(var(--destructive-foreground))` | Text on destructive background |
| `muted`                  | `hsl(var(--muted))`                  | Muted backgrounds              |
| `muted-foreground`       | `hsl(var(--muted-foreground))`       | Muted text, captions           |
| `accent`                 | `hsl(var(--accent))`                 | Accent backgrounds             |
| `accent-foreground`      | `hsl(var(--accent-foreground))`      | Text on accent background      |
| `card`                   | `hsl(var(--card))`                   | Card backgrounds               |
| `card-foreground`        | `hsl(var(--card-foreground))`        | Text on cards                  |
| `border`                 | `hsl(var(--border))`                 | Border color                   |
| `input`                  | `hsl(var(--input))`                  | Input borders                  |
| `ring`                   | `hsl(var(--ring))`                   | Focus ring color               |

### Spacing Scale

Use Tailwind's spacing scale consistently:

| Class                | Size          | Usage             |
| -------------------- | ------------- | ----------------- |
| `space-y-1`, `gap-1` | 0.25rem (4px) | Tight grouping    |
| `space-y-2`, `gap-2` | 0.5rem (8px)  | Related items     |
| `space-y-4`, `gap-4` | 1rem (16px)   | Section spacing   |
| `space-y-6`, `gap-6` | 1.5rem (24px) | Component spacing |
| `space-y-8`, `gap-8` | 2rem (32px)   | Section breaks    |
| `py-12`, `my-12`     | 3rem (48px)   | Major sections    |
| `py-16`, `my-16`     | 4rem (64px)   | Page sections     |

### Border Radius

| Class        | Value                       |
| ------------ | --------------------------- |
| `rounded-sm` | `calc(var(--radius) - 4px)` |
| `rounded-md` | `calc(var(--radius) - 2px)` |
| `rounded-lg` | `var(--radius)` (0.5rem)    |

### Animations

| Animation                     | Keyframes             | Usage             |
| ----------------------------- | --------------------- | ----------------- |
| `animate-fade-in`             | `fade-in`             | Element entrance  |
| `animate-slide-in`            | `slide-in`            | Slide from bottom |
| `animate-slide-in-from-top`   | `slide-in-from-top`   | Slide from top    |
| `animate-slide-in-from-left`  | `slide-in-from-left`  | Slide from left   |
| `animate-slide-in-from-right` | `slide-in-from-right` | Slide from right  |
| `animate-slide-out`           | `slide-out`           | Element exit      |
| `animate-spin`                | `spin`                | Loading spinners  |
| `animate-pulse`               | `pulse`               | Skeleton loaders  |

---

## Component Styling

### Utility Function: `cn()`

The `cn()` function merges Tailwind classes intelligently:

```typescript
import { cn } from '@/lib/utils';

// Basic usage
cn('px-2 py-1', 'px-4'); // => 'py-1 px-4'

// Conditional classes
cn('text-red-500', condition && 'text-blue-500');

// Array syntax
cn(['base-class', isActive && 'active-class', 'another-class']);
```

### Class Variance Authority (CVA)

Use CVA to define component variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Extract type for component props
export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // ... other props
}
```

### Component Structure

Each styled component should:

1. **Use CVA for variants** if it has multiple visual variations
2. **Accept className prop** for one-off customizations
3. **Merge classes with cn()** to handle conflicts
4. **Use semantic color tokens** instead of hard-coded colors
5. **Include focus states** for accessibility

**Example:**

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card text-card-foreground shadow-sm',
        variant === 'bordered' && 'border border-border',
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

## Responsive Design

### Mobile-First Approach

Always write styles mobile-first, then add breakpoints for larger screens:

```tsx
// ✅ Good: Mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// ❌ Bad: Desktop-first
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
```

### Breakpoints

| Prefix | Min Width | Device           |
| ------ | --------- | ---------------- |
| (none) | 0px       | Mobile (default) |
| `sm:`  | 640px     | Large mobile     |
| `md:`  | 768px     | Tablet           |
| `lg:`  | 1024px    | Laptop           |
| `xl:`  | 1280px    | Desktop          |
| `2xl:` | 1536px    | Large desktop    |

### Container

Use the `Container` component or custom container utilities:

```tsx
import { Container } from '@/components/layout/Container';

<Container>
  {/* Content with responsive padding and max-width */}
</Container>

// Or use utility class
<div className="container-custom">
  {/* Custom container with max-w-7xl */}
</div>
```

---

## Typography

### Font Families

```tsx
<div className="font-sans">  {/* Default system font stack */}
<code className="font-mono"> {/* Monospace for code */}
```

### Text Sizes

```tsx
<h1 className="text-4xl font-bold tracking-tight">Page Title</h1>
<h2 className="text-3xl font-semibold">Section Title</h2>
<h3 className="text-2xl font-semibold">Subsection</h3>
<h4 className="text-xl font-medium">Card Title</h4>
<p className="text-base text-foreground">Body text</p>
<span className="text-sm text-muted-foreground">Caption</span>
<small className="text-xs text-muted-foreground">Helper text</small>
```

### Rich Text (Prose)

For rich text content (markdown, blog posts):

```tsx
<article className="prose-custom">{/* Markdown or HTML content */}</article>
```

---

## Dark Mode

### Implementation

Dark mode is implemented using `next-themes` with class-based strategy:

```tsx
// In app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider';

<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>;
```

### Theme Toggle

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

<ThemeToggle />;
```

### Dark Mode Variants

Use the `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white text-black dark:bg-slate-900 dark:text-white">
  {/* Content */}
</div>
```

**Best Practice:** Use semantic color tokens instead of manual dark mode variants:

```tsx
// ✅ Good: Uses theme colors
<div className="bg-background text-foreground">

// ❌ Avoid: Manual dark mode variants
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
```

---

## Accessibility

### Focus States

Always include visible focus states:

```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click me
</button>

// Or use the utility class
<button className="focus-ring">
  Click me
</button>
```

### Color Contrast

- Use semantic color pairs (e.g., `bg-primary` with `text-primary-foreground`)
- Ensure minimum 4.5:1 contrast ratio for text
- Test with dark mode enabled

### Screen Readers

Use `sr-only` for screen-reader-only content:

```tsx
<button>
  <Icon />
  <span className="sr-only">Close dialog</span>
</button>
```

### Reduced Motion

Respect user's motion preferences:

```tsx
<div className="transition-transform motion-reduce:transition-none">
  {/* Content */}
</div>
```

### Touch Targets

Ensure minimum 44x44px touch targets on mobile:

```tsx
<button className="h-11 min-w-[44px] px-4">Button</button>
```

---

## Best Practices

### 1. Use Semantic Colors

```tsx
// ✅ Good
<div className="bg-primary text-primary-foreground">

// ❌ Bad
<div className="bg-blue-600 text-white">
```

### 2. Consistent Spacing

```tsx
// ✅ Good: Consistent spacing scale
<div className="space-y-4">
  <div className="p-4">...</div>
  <div className="p-4">...</div>
</div>

// ❌ Bad: Arbitrary spacing
<div className="space-y-[13px]">
  <div className="p-[17px]">...</div>
</div>
```

### 3. Mobile-First Responsive

```tsx
// ✅ Good
<div className="grid grid-cols-1 md:grid-cols-2">

// ❌ Bad
<div className="grid grid-cols-2 sm:grid-cols-1">
```

### 4. Avoid Arbitrary Values

```tsx
// ✅ Good: Use design tokens
<div className="rounded-lg p-4">

// ❌ Bad: Arbitrary values
<div className="rounded-[13px] p-[17px]">
```

### 5. Component Composability

```tsx
// ✅ Good: Accept className for customization
<Button className="w-full">Submit</Button>

// ❌ Bad: No customization
<Button>Submit</Button> {/* Cannot add custom styles */}
```

### 6. Use Utility Classes

```tsx
// ✅ Good: Utility classes
<div className="glass card-hover">

// ❌ Bad: Inline styles
<div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
```

### 7. Group Related Styles

```tsx
// ✅ Good: Grouped by category
<button
  className="
    inline-flex items-center justify-center gap-2
    rounded-md px-4 py-2
    bg-primary text-primary-foreground
    hover:bg-primary/90
    focus-visible:ring-2 focus-visible:ring-ring
    disabled:opacity-50
  "
>

// ❌ Bad: Random order
<button className="bg-primary px-4 focus-visible:ring-2 inline-flex text-primary-foreground hover:bg-primary/90 gap-2 disabled:opacity-50">
```

### 8. Extract Repeated Patterns

If you find yourself repeating the same class combinations, consider:

- Creating a utility class in globals.css
- Creating a reusable component
- Using CVA to define variants

---

## Related Documentation

- [Component Architecture](/docs/components/README.md)
- [Design Patterns](/docs/architecture/patterns.md)
- [Accessibility Guidelines](/docs/accessibility.md) _(coming soon)_

---

## Questions?

For questions or suggestions about styling standards, please reach out to the development team or open an issue in the repository.
