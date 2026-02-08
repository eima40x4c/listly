# SOP-503: Documentation

## Purpose

Establish documentation standards to ensure code, APIs, and processes are well-documented for current and future developers. Good documentation reduces onboarding time, prevents knowledge loss, and improves maintainability.

---

## Scope

- **Applies to:** All project documentation
- **Covers:** Code docs, API docs, README, architecture docs, guides
- **Does not cover:** User-facing documentation, marketing materials

---

## Prerequisites

- [ ] SOP-003 (Project Structure) — project organized
- [ ] SOP-200 (API Design) — APIs defined
- [ ] Core features implemented

---

## Procedure

### 1. Documentation Types

| Type | Location | Purpose | Audience |
|------|----------|---------|----------|
| **README** | `/README.md` | Project overview, quick start | All developers |
| **API Docs** | `/docs/api/` or generated | Endpoint reference | API consumers |
| **Architecture** | `/docs/architecture/` | System design, decisions | Senior devs |
| **Guides** | `/docs/guides/` | How-to tutorials | All developers |
| **Code Comments** | Inline | Complex logic explanation | Contributors |
| **JSDoc/TSDoc** | Inline | Function/type documentation | Contributors |
| **CONTRIBUTING** | `/CONTRIBUTING.md` | How to contribute | Contributors |
| **CHANGELOG** | `/CHANGELOG.md` | Version history | All |

### 2. README Template

```markdown
# Project Name

Brief description of what this project does.

## Features

- ✅ Feature one
- ✅ Feature two
- 🚧 Feature in progress

## Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL with Prisma
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

### Installation

```bash
# Clone the repository
git clone https://github.com/org/project.git
cd project

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Set up database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Auth encryption secret | Yes |
| `NEXTAUTH_URL` | App URL | Yes |

## Development

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Build for production
pnpm build
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Core utilities
└── types/            # TypeScript types
```

See [Architecture Docs](./docs/architecture/) for details.

## API Documentation

See [API Reference](./docs/api/) for endpoint documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE)
```

### 3. TSDoc for Functions and Types

```typescript
// src/lib/utils/date.ts

/**
 * Formats a date into a human-readable relative time string.
 *
 * @param date - The date to format (Date object or ISO string)
 * @param options - Formatting options
 * @returns Relative time string like "2 hours ago" or "in 3 days"
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 3600000))
 * // => "1 hour ago"
 *
 * formatRelativeTime(new Date(Date.now() + 86400000))
 * // => "in 1 day"
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat MDN RelativeTimeFormat}
 */
export function formatRelativeTime(
  date: Date | string,
  options?: RelativeTimeOptions
): string {
  // Implementation
}

/**
 * Options for relative time formatting.
 */
export interface RelativeTimeOptions {
  /** Locale for formatting (default: 'en-US') */
  locale?: string;
  /** Style of output: 'long' | 'short' | 'narrow' (default: 'long') */
  style?: Intl.RelativeTimeFormatStyle;
}
```

```typescript
// src/types/user.ts

/**
 * Represents a user in the system.
 *
 * @remarks
 * Users can have different roles that determine their permissions.
 * See {@link UserRole} for available roles.
 */
export interface User {
  /** Unique identifier (CUID) */
  id: string;

  /** User's email address (unique) */
  email: string;

  /** Display name */
  name: string;

  /** User's role for authorization */
  role: UserRole;

  /** Account creation timestamp */
  createdAt: Date;

  /** Last profile update timestamp */
  updatedAt: Date;
}

/**
 * Available user roles in the system.
 *
 * @remarks
 * - `USER`: Standard user with basic permissions
 * - `ADMIN`: Full access to all features and admin panel
 */
export type UserRole = 'USER' | 'ADMIN';
```

### 4. API Documentation with OpenAPI

```yaml
# docs/api/openapi.yaml

openapi: 3.0.3
info:
  title: Project API
  description: REST API for Project
  version: 1.0.0
  contact:
    email: support@example.com

servers:
  - url: http://localhost:3000/api
    description: Development
  - url: https://api.example.com
    description: Production

tags:
  - name: Users
    description: User management endpoints
  - name: Auth
    description: Authentication endpoints

paths:
  /users:
    get:
      summary: List all users
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    $ref: '#/components/schemas/Pagination'

  /users/{id}:
    get:
      summary: Get user by ID
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: cuid_12345
        email:
          type: string
          format: email
          example: user@example.com
        name:
          type: string
          example: John Doe
        role:
          type: string
          enum: [USER, ADMIN]
        createdAt:
          type: string
          format: date-time

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

  responses:
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                    example: NOT_FOUND
                  message:
                    type: string
                    example: User not found

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 5. Architecture Decision Records (ADRs)

```markdown
<!-- docs/architecture/decisions/001-use-next-app-router.md -->

# ADR 001: Use Next.js App Router

## Status

Accepted

## Context

We need to choose a routing approach for our Next.js application.
Options considered:
1. Pages Router (traditional)
2. App Router (new, React Server Components)

## Decision

We will use the Next.js App Router with React Server Components.

## Consequences

### Positive
- Better performance through server-side rendering by default
- Simplified data fetching with async components
- Built-in layouts and nested routing
- Future-proof as the recommended approach

### Negative
- Learning curve for team members used to Pages Router
- Some third-party libraries may not yet support RSC
- Need to understand client/server component boundaries

### Neutral
- Different mental model for data fetching
- New file naming conventions (page.tsx, layout.tsx)

## Related

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- ADR-002: Component Library Choice
```

```markdown
<!-- docs/architecture/decisions/template.md -->

# ADR [NUMBER]: [TITLE]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context

What is the issue that we're seeing that is motivating this decision?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult because of this change?

### Positive
- 

### Negative
- 

### Neutral
- 

## Related

- Links to related ADRs or documentation
```

### 6. How-To Guides

```markdown
<!-- docs/guides/adding-new-feature.md -->

# How to Add a New Feature

This guide walks through adding a new feature end-to-end.

## Overview

1. Define the data model
2. Create database migration
3. Build API endpoints
4. Create UI components
5. Add tests
6. Update documentation

## Step 1: Define Data Model

Add your model to `prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())
}
```

Run migration:
```bash
pnpm prisma migrate dev --name add-products
```

## Step 2: Create API Endpoints

Create `src/app/api/products/route.ts`:
...

## Step 3: Create Components

Create feature components in `src/components/features/products/`:
...

## Step 4: Add Tests

Create tests in `src/components/features/products/__tests__/`:
...

## Checklist

- [ ] Schema updated
- [ ] Migration created
- [ ] API endpoints working
- [ ] Components created
- [ ] Tests passing
- [ ] Documentation updated
```

### 7. CONTRIBUTING Template

```markdown
<!-- CONTRIBUTING.md -->

# Contributing to [Project Name]

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a branch: `git checkout -b feat/your-feature`
4. Make your changes
5. Run tests: `pnpm test`
6. Commit with conventional commits
7. Push and create a Pull Request

## Development Setup

See [README.md](./README.md#getting-started) for setup instructions.

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Run `pnpm lint` before committing
- Run `pnpm type-check` to verify types

## Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

feat(auth): add password reset
fix(cart): correct total calculation
docs(readme): update installation
```

## Pull Request Process

1. Update documentation for any changed behavior
2. Add/update tests for new functionality
3. Ensure CI passes
4. Request review from maintainers

## Reporting Issues

- Use the issue templates
- Include reproduction steps
- Provide environment details

## Code of Conduct

Be respectful and inclusive. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
```

### 8. Generate Documentation

```json
// package.json
{
  "scripts": {
    "docs:generate": "typedoc --out docs/api src/lib",
    "docs:serve": "npx serve docs"
  }
}
```

Install TypeDoc:
```bash
pnpm add -D typedoc
```

Create `typedoc.json`:
```json
{
  "entryPoints": ["src/lib"],
  "entryPointStrategy": "expand",
  "out": "docs/api",
  "exclude": ["**/*.test.ts", "**/__mocks__/**"],
  "excludePrivate": true,
  "excludeProtected": true,
  "theme": "default",
  "name": "Project API Documentation",
  "readme": "none"
}
```

### 9. Documentation Checklist

```markdown
## Documentation Completeness Checklist

### Essential (Must Have)
- [ ] README with setup instructions
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] CONTRIBUTING guide

### Important (Should Have)
- [ ] Architecture overview
- [ ] Key ADRs documented
- [ ] Deployment guide
- [ ] Troubleshooting guide

### Nice to Have
- [ ] Video walkthroughs
- [ ] Onboarding guide
- [ ] FAQ section
- [ ] Glossary of terms
```

---

## Review Checklist

- [ ] README complete and accurate
- [ ] TSDoc on exported functions
- [ ] API documentation generated/updated
- [ ] Architecture decisions documented
- [ ] CONTRIBUTING guide exists
- [ ] Environment variables documented
- [ ] Setup instructions work for new developer

---

## AI Agent Prompt Template

```
Create comprehensive documentation for this project.

Read:
- Project structure and existing docs
- `src/lib/` for exported functions
- `src/app/api/` for API routes

Execute SOP-503 (Documentation):
1. Create/update README with setup guide
2. Add TSDoc to exported functions
3. Create OpenAPI specification
4. Document key architecture decisions
5. Create CONTRIBUTING.md
6. Set up documentation generation
```

---

## Outputs

- [ ] `README.md` — Complete project documentation
- [ ] `CONTRIBUTING.md` — Contributor guide
- [ ] `docs/api/openapi.yaml` — API specification
- [ ] `docs/architecture/` — Architecture docs and ADRs
- [ ] `docs/guides/` — How-to guides
- [ ] TSDoc comments in code
- [ ] `typedoc.json` — Doc generation config

---

## Related SOPs

- **SOP-200:** API Design (API documentation)
- **SOP-003:** Project Structure (folder organization)
- **SOP-002:** Repository Setup (README basics)

---

## Documentation Principles

| Principle | Description |
|-----------|-------------|
| **Keep it Updated** | Outdated docs are worse than no docs |
| **Write for Newcomers** | Assume no prior knowledge |
| **Show Examples** | Code examples > prose |
| **Be Concise** | Respect reader's time |
| **Link Don't Repeat** | Reference existing docs |
| **Version Control** | Docs live with code |
