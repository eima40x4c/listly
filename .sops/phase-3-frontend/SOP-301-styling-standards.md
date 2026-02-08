# SOP-301: Styling Standards

## Purpose

Establish consistent styling practices that ensure visual coherence, maintainability, and responsive design. Good styling standards make the UI predictable and easier to extend.

---

## Scope

- **Applies to:** All frontend styling decisions
- **Covers:** CSS methodology, Tailwind configuration, theming, responsive design
- **Does not cover:** Component logic (SOP-300), accessibility (embedded here)

---

## Prerequisites

- [ ] SOP-003 (Project Structure) completed
- [ ] SOP-300 (Component Architecture) completed
- [ ] Styling solution selected (Tailwind recommended)

---

## Procedure

### 1. Install and Configure Tailwind CSS

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom colors using CSS variables
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### 3. Set Up CSS Variables for Theming

```css
/* src/app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 4. Create Utility Functions

```typescript
// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install dependencies:
```bash
pnpm add clsx tailwind-merge
```

### 5. Create Class Variance Authority (cva) for Variants

```typescript
// src/lib/cva.ts

import { cva, type VariantProps } from 'class-variance-authority';

export { cva, type VariantProps };

// Example button variants
export const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

Install cva:
```bash
pnpm add class-variance-authority
```

### 6. Responsive Design Standards

**Breakpoints (Tailwind defaults):**

| Prefix | Min Width | Device |
|--------|-----------|--------|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Large mobile |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

**Mobile-first approach:**
```tsx
// ✅ Good: Mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// ❌ Bad: Desktop-first
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
```

**Responsive container:**
```tsx
// src/components/layout/Container/Container.tsx

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn(
      'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
}
```

### 7. Spacing and Sizing Scale

Use consistent spacing:

| Class | Size | Usage |
|-------|------|-------|
| `space-y-1`, `gap-1` | 0.25rem (4px) | Tight grouping |
| `space-y-2`, `gap-2` | 0.5rem (8px) | Related items |
| `space-y-4`, `gap-4` | 1rem (16px) | Section spacing |
| `space-y-6`, `gap-6` | 1.5rem (24px) | Component spacing |
| `space-y-8`, `gap-8` | 2rem (32px) | Section breaks |
| `py-12`, `my-12` | 3rem (48px) | Major sections |
| `py-16`, `my-16` | 4rem (64px) | Page sections |

### 8. Typography Standards

```css
/* Add to globals.css or use Tailwind Typography plugin */

@layer components {
  .prose-custom {
    @apply prose prose-slate max-w-none
      prose-headings:font-bold
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-lg
      prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
      dark:prose-invert;
  }
}
```

**Text sizes:**
```tsx
<h1 className="text-4xl font-bold tracking-tight">Page Title</h1>
<h2 className="text-3xl font-semibold">Section Title</h2>
<h3 className="text-2xl font-semibold">Subsection</h3>
<p className="text-base text-muted-foreground">Body text</p>
<span className="text-sm text-muted-foreground">Caption</span>
```

### 9. Dark Mode Implementation

```typescript
// src/components/ThemeProvider.tsx

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

```tsx
// src/app/layout.tsx

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```tsx
// src/components/ThemeToggle.tsx

'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

Install next-themes:
```bash
pnpm add next-themes
```

### 10. Accessibility in Styling

| Requirement | Implementation |
|-------------|----------------|
| **Focus visible** | `focus-visible:ring-2 focus-visible:ring-ring` |
| **Color contrast** | Use foreground/background pairs |
| **Screen reader** | `sr-only` for hidden labels |
| **Reduced motion** | `motion-reduce:transition-none` |
| **Touch targets** | Minimum 44x44px for buttons |

```tsx
// Accessible button example
<button className="
  h-11 px-4
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  motion-reduce:transition-none
">
  Click me
</button>
```

---

## Review Checklist

- [ ] Tailwind CSS installed and configured
- [ ] CSS variables for theming set up
- [ ] `cn()` utility function created
- [ ] cva variants configured for components
- [ ] Responsive breakpoints documented
- [ ] Spacing scale followed consistently
- [ ] Dark mode implemented
- [ ] Typography standards defined
- [ ] Accessibility requirements met
- [ ] Focus states visible

---

## AI Agent Prompt Template

```
Set up styling standards for this project.

Read:
- `/docs/tech-stack.md` for framework
- `tailwind.config.ts` if exists

Execute SOP-301 (Styling Standards):
1. Configure Tailwind CSS with custom theme
2. Set up CSS variables for theming
3. Create utility functions (cn)
4. Configure cva for component variants
5. Implement dark mode support
6. Document styling conventions
```

---

## Outputs

- [ ] `tailwind.config.ts` — Tailwind configuration
- [ ] `src/app/globals.css` — Global styles with CSS variables
- [ ] `src/lib/utils.ts` — Utility functions
- [ ] `src/lib/cva.ts` — Component variants
- [ ] `src/components/ThemeProvider.tsx` — Theme provider
- [ ] `src/components/ThemeToggle.tsx` — Theme toggle

---

## Related SOPs

- **SOP-300:** Component Architecture (component structure)
- **SOP-006:** Code Style Standards (formatting)
- **SOP-303:** Form Handling (form styling)
- **SOP-304:** Progressive Web App (mobile-first styling) *(optional)*
