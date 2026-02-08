# SOP-003: Project Structure

## Purpose

Define a consistent, scalable folder structure that organizes code logically, separates concerns, and follows framework conventions. A well-organized structure improves maintainability and helps team members navigate the codebase efficiently.

---

## Scope

- **Applies to:** All new projects after tech stack selection
- **Covers:** Folder organization, file naming, module boundaries
- **Does not cover:** File contents (see implementation SOPs)

---

## Prerequisites

- [ ] SOP-001 (Tech Stack Selection) completed
- [ ] SOP-002 (Repository Setup) completed
- [ ] `/docs/tech-stack.md` exists

---

## Procedure

### 1. Review Framework Conventions

Each framework has preferred conventions. Follow them unless there's a strong reason not to.

**Key principle:** Convention over configuration.

### 2. Choose Structure Based on Tech Stack

---

#### Next.js (App Router) Project Structure

```
project-root/
├── .github/                    # GitHub workflows, templates
├── .prompts/                   # AI session files
├── .sops/                      # SOPs (if included)
├── docs/                       # Project documentation
│   ├── requirements.md
│   ├── tech-stack.md
│   └── database/
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                     # Static assets
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/                    # App Router pages & layouts
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   └── dashboard/
│   │   ├── api/                # API routes
│   │   │   └── auth/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (Button, Input)
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Layout components (Header, Footer)
│   │   └── features/           # Feature-specific components
│   ├── lib/                    # Utility libraries
│   │   ├── db.ts               # Database client
│   │   ├── auth.ts             # Auth configuration
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── services/               # Business logic / API calls
│   └── config/                 # App configuration
├── tests/                      # Test files
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

#### Python/FastAPI Project Structure

```
project-root/
├── .github/
├── .prompts/
├── .sops/
├── docs/
│   ├── requirements.md
│   └── tech-stack.md
├── src/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry
│   │   ├── config.py           # Settings/configuration
│   │   ├── api/                # API routes
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes/
│   │   │   │   │   ├── users.py
│   │   │   │   │   └── auth.py
│   │   │   │   └── router.py
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── base.py
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   └── user_service.py
│   │   ├── repositories/       # Data access layer
│   │   │   └── user_repository.py
│   │   └── utils/              # Utilities
│   │       ├── __init__.py
│   │       └── security.py
├── migrations/                 # Alembic migrations
│   ├── versions/
│   └── alembic.ini
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── .env.example
├── .gitignore
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

#### Express.js/Node.js Project Structure

```
project-root/
├── .github/
├── .prompts/
├── .sops/
├── docs/
├── src/
│   ├── config/                 # Configuration
│   │   ├── index.ts
│   │   └── database.ts
│   ├── controllers/            # Request handlers
│   │   ├── user.controller.ts
│   │   └── auth.controller.ts
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── error-handler.ts
│   ├── models/                 # Database models
│   │   └── user.model.ts
│   ├── routes/                 # Route definitions
│   │   ├── index.ts
│   │   ├── user.routes.ts
│   │   └── auth.routes.ts
│   ├── services/               # Business logic
│   │   └── user.service.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── utils/                  # Utilities
│   │   └── helpers.ts
│   ├── validators/             # Input validation
│   │   └── user.validator.ts
│   └── app.ts                  # App entry point
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

### 3. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UserCard.tsx` |
| Utilities/Hooks | camelCase | `useAuth.ts`, `formatDate.ts` |
| Routes/Pages | kebab-case (folders) | `user-profile/page.tsx` |
| Config files | kebab-case | `tailwind.config.ts` |
| Tests | Same as source + `.test` | `UserCard.test.tsx` |
| Constants | SCREAMING_SNAKE | Inside file, not filename |

### 4. Module Organization Principles

**Colocation:** Keep related files together.
```
components/
  └── UserCard/
      ├── UserCard.tsx        # Component
      ├── UserCard.test.tsx   # Test
      ├── UserCard.stories.tsx # Storybook
      └── index.ts            # Export
```

**Separation of Concerns:**
```
src/
  ├── components/    # UI (presentation)
  ├── services/      # Business logic
  ├── hooks/         # State management
  ├── types/         # Type definitions
  └── lib/           # Utilities
```

### 5. Create Folder Structure

Based on tech stack, create the structure:

```bash
# Next.js example
mkdir -p src/{app,components/{ui,forms,layout,features},lib,hooks,types,services,config}
mkdir -p docs prisma/{migrations} public/{images,fonts} tests/{unit,integration}
```

### 6. Add Index Exports (Barrel Files)

Create `index.ts` files for clean imports:

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
```

Usage:
```typescript
import { Button, Input, Card } from '@/components/ui';
```

### 7. Configure Path Aliases

**TypeScript (tsconfig.json):**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

### 8. Document Structure

Add to `docs/architecture/project-structure.md`:

```markdown
# Project Structure

## Overview

This project follows [Next.js App Router / FastAPI / etc.] conventions.

## Directory Map

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Routes and pages |
| `src/components/` | Reusable UI components |
| `src/lib/` | Utility functions and configurations |
| `src/services/` | Business logic and API integrations |
| `src/hooks/` | Custom React hooks |
| `src/types/` | TypeScript type definitions |

## Naming Conventions

- Components: PascalCase (`UserCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Folders: kebab-case (`user-profile/`)

## Import Aliases

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
```

---

## Review Checklist

- [ ] Folder structure follows framework conventions
- [ ] All major directories created
- [ ] File naming conventions documented
- [ ] Path aliases configured
- [ ] Barrel files created for components
- [ ] Structure documented in `/docs/architecture/project-structure.md`

---

## AI Agent Prompt Template

```
Set up the project folder structure.

Read `/docs/tech-stack.md` for framework information.

Execute SOP-003 (Project Structure):
1. Create folder structure appropriate for the tech stack
2. Set up path aliases in tsconfig.json
3. Create initial barrel files (index.ts)
4. Document the structure in `/docs/architecture/project-structure.md`
```

---

## Outputs

- [ ] Complete folder structure created
- [ ] Path aliases configured
- [ ] `/docs/architecture/project-structure.md` created

---

## Related SOPs

- **SOP-001:** Tech Stack Selection (determines structure conventions)
- **SOP-002:** Repository Setup (base repository exists)
- **SOP-004:** Environment Setup (configuration files)
- **SOP-005:** Design Patterns (architecture aligns with patterns)
