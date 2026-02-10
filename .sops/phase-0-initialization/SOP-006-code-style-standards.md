# SOP-006: Code Style Standards

## Purpose

Establish consistent code formatting, naming conventions, and style guidelines across the project. Consistent style improves readability, reduces cognitive load during code review, and prevents style-related merge conflicts.

---

## Scope

- **Applies to:** All code in the project
- **Covers:** Formatting, naming, file organization, comments
- **Does not cover:** Architecture decisions (SOP-005), testing patterns (SOP-500)

---

## Prerequisites

- [ ] SOP-001 (Tech Stack Selection) completed
- [ ] SOP-003 (Project Structure) completed
- [ ] Editor/IDE configured

---

## Procedure

### 1. Install Tooling

```bash
# ESLint + Prettier
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier

# TypeScript ESLint
pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Import sorting
pnpm add -D eslint-plugin-import eslint-plugin-simple-import-sort

# React/Next.js specific
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks eslint-config-next
```

### 2. ESLint Configuration

```javascript
// eslint.config.js (ESLint 9+ flat config)

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      prettier,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',

      // Prettier
      'prettier/prettier': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    ignores: ['node_modules/', '.next/', 'dist/', 'build/', '*.config.js'],
  },
];
```

### 3. Prettier Configuration

```javascript
// prettier.config.js

/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
};
```

```jsonc
// .prettierignore
node_modules/
.next/
dist/
build/
coverage/
*.min.js
pnpm-lock.yaml
```

### 4. TypeScript Naming Conventions

| Type           | Convention                 | Example                       |
| -------------- | -------------------------- | ----------------------------- |
| **Variables**  | camelCase                  | `userName`, `isLoading`       |
| **Constants**  | SCREAMING_SNAKE_CASE       | `MAX_RETRIES`, `API_URL`      |
| **Functions**  | camelCase, verb prefix     | `getUserById`, `handleSubmit` |
| **Classes**    | PascalCase                 | `UserService`, `ApiClient`    |
| **Interfaces** | PascalCase (no I prefix)   | `User`, `ApiResponse`         |
| **Types**      | PascalCase                 | `UserId`, `ButtonVariant`     |
| **Enums**      | PascalCase                 | `UserRole`, `OrderStatus`     |
| **Components** | PascalCase                 | `UserCard`, `NavBar`          |
| **Hooks**      | camelCase, use prefix      | `useAuth`, `useUsers`         |
| **Files**      | kebab-case or PascalCase\* | See below                     |

\*Files: Components use PascalCase (`Button.tsx`), utilities use kebab-case (`date-utils.ts`).

### 5. File Naming Conventions

```
src/
├── components/
│   └── ui/
│       └── Button/
│           ├── Button.tsx        # PascalCase for components
│           ├── Button.test.tsx   # Test files match component
│           └── index.ts          # Barrel export
├── lib/
│   ├── utils/
│   │   ├── date-utils.ts         # kebab-case for utilities
│   │   └── format-currency.ts
│   └── hooks/
│       ├── use-auth.ts           # kebab-case, use- prefix
│       └── use-users.ts
├── types/
│   ├── user.ts                   # kebab-case, singular
│   └── api-response.ts
└── app/
    ├── page.tsx                  # Next.js conventions
    └── layout.tsx
```

### 6. Import Organization

Imports should be sorted in this order:

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 2. External packages
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatDate } from '@/lib/utils/date-utils';
import type { User } from '@/types/user';

// 4. Relative imports
import { UserAvatar } from './UserAvatar';
import styles from './UserCard.module.css';
```

### 7. Component Structure

```typescript
// Recommended component structure

// 1. Imports (sorted)
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/user';

// 2. Types/Interfaces
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  className?: string;
}

// 3. Component
export function UserCard({ user, onEdit, className }: UserCardProps) {
  // 3a. Hooks (all hooks at the top)
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Derived state / computations
  const fullName = `${user.firstName} ${user.lastName}`;

  // 3c. Event handlers
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    onEdit?.(user.id);
  };

  // 3d. Render
  return (
    <div className={className}>
      <h3>{fullName}</h3>
      <p>{user.email}</p>
      {isExpanded && <p>{user.bio}</p>}
      <Button onClick={handleClick}>
        {isExpanded ? 'Show Less' : 'Show More'}
      </Button>
      {onEdit && <Button onClick={handleEdit}>Edit</Button>}
    </div>
  );
}
```

### 8. Comment Standards

```typescript
// ✅ Good: Explains WHY
// We use a timeout here because the API has a race condition
// that causes duplicate submissions without a delay
await new Promise((resolve) => setTimeout(resolve, 100));

// ❌ Bad: Explains WHAT (obvious from code)
// Set the timeout to 100ms
await new Promise((resolve) => setTimeout(resolve, 100));

// ✅ Good: TODO with context
// TODO(john): Remove after migration complete (Q2 2024)
const legacyAdapter = useLegacyApi();

// ❌ Bad: Vague TODO
// TODO: Fix this later

// ✅ Good: JSDoc for public APIs
/**
 * Formats a date relative to now (e.g., "2 hours ago").
 *
 * @param date - The date to format
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(date: Date): string {
  // ...
}
```

### 9. VS Code Settings

```jsonc
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never", // Let eslint handle imports
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.autoImports": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
}
```

```jsonc
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
  ],
}
```

### 10. Git Hooks with Husky

```bash
# Install
pnpm add -D husky lint-staged

# Initialize
pnpm exec husky init
```

```javascript
// lint-staged.config.js
export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
```

```bash
# .husky/pre-commit
pnpm lint-staged
```

### 11. Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Review Checklist

- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Import sorting enabled
- [ ] Naming conventions documented
- [ ] VS Code settings added
- [ ] Git hooks set up
- [ ] Team aligned on conventions

---

## AI Agent Prompt Template

```
Set up code style standards for this project.

Read:
- `package.json` for existing dependencies
- Project structure

Execute SOP-006 (Code Style Standards):
1. Install ESLint, Prettier, and plugins
2. Create ESLint configuration
3. Create Prettier configuration
4. Set up VS Code settings
5. Configure Git hooks with Husky
6. Add lint scripts to package.json
```

---

## Outputs

- [ ] `eslint.config.js` — ESLint configuration
- [ ] `prettier.config.js` — Prettier configuration
- [ ] `.vscode/settings.json` — Editor settings
- [ ] `.vscode/extensions.json` — Recommended extensions
- [ ] `.husky/pre-commit` — Git hook
- [ ] `lint-staged.config.js` — Staged file linting

---

## Related SOPs

- **SOP-003:** Project Structure (file organization)
- **SOP-005:** Design Patterns (code patterns)
- **SOP-502:** Code Review (style in reviews)
