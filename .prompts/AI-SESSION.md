# AI Development Session

> **AI Agent Responsibility:** This file is managed by the AI agent. The human only provides the initial project description—the AI fills in and updates everything else.

---

## 🤖 AI Agent Instructions

**On first session:**

1. Fill in the Project Overview table (name, description, root, date)
2. Document the Project Goals from the user's description
3. Begin with SOP-000 and update the tracker as you progress

**On each SOP completion:**

1. Update the SOP's status in the Progress Tracker (⬚ → ✅)
2. Record the actual output locations
3. Add any notes about deviations or decisions
4. Update the "Current Session" section for the next SOP
5. Update the "Session Prompt Template" with current state
6. Add an entry to the Session Log

**On session resume:**

1. Read this file to recover context
2. Continue from the next incomplete SOP
3. Update all sections as you progress

---

## 📋 Project Overview

| Field            | Value                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Project Name** | Listly - Smart Shopping Companion                                                                                     |
| **Description**  | Mobile-first PWA for smart shopping list management with real-time collaboration, AI suggestions, and pantry tracking |
| **Project Root** | `/home/eima40x4c/Projects/listly`                                                                                     |
| **Started**      | 2026-02-07                                                                                                            |

---

## Project Goals

- Smart shopping list management with multiple lists and real-time collaboration
- Auto-categorization of items by store aisle for efficient shopping
- Budget tracking with price history to help users save money
- AI-powered suggestions based on purchase patterns
- Pantry inventory management with expiration date tracking
- Meal planning and recipe integration to streamline shopping
- Offline-first PWA with background sync for reliability
- Location-based reminders when near stores

---

## SOP Progress Tracker

### Phase 0: Initialization

| SOP | Title                  | Status | Output Location                                                                                                  | Notes                                                       |
| --- | ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 000 | Requirements Gathering | ✅     | `/docs/requirements.md`                                                                                          | Complete                                                    |
| 001 | Tech Stack Selection   | ✅     | `/docs/tech-stack.md`                                                                                            | Complete - Selected Next.js, PostgreSQL, Supabase           |
| 002 | Repository Setup       | ✅     | `.gitignore`, `README.md`, `CONTRIBUTING.md`, `.github/pull_request_template.md`                                 | Complete - Git initialized, conventional commits documented |
| 003 | Project Structure      | ✅     | `src/`, `tsconfig.json`, `/docs/architecture/project-structure.md`                                               | Complete - Next.js App Router structure with path aliases   |
| 004 | Environment Setup      | ✅     | `.env.example`, `/docs/environment-variables.md`, `/docs/development-setup.md`, `docker-compose.yml`, `.vscode/` | Complete - Environment configuration with Docker services   |
| 005 | Design Patterns        | ✅     | `/docs/architecture/patterns.md`                                                                                 | Complete - Modular Monolith with feature-based organization |
| 006 | Code Style Standards   | ✅     | `eslint.config.js`, `prettier.config.js`, `.prettierignore`, `lint-staged.config.js`, `.husky/pre-commit`        | Complete - ESLint, Prettier, import sorting, git hooks      |

### Phase 1: Database

| SOP | Title              | Status | Output Location                                                        | Notes                                                                         |
| --- | ------------------ | ------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 100 | Database Selection | ✅     | `/docs/database/database-decision.md`, `/docs/tech-stack.md` (updated) | Complete - PostgreSQL 16 + Supabase + Prisma with comprehensive documentation |
| 101 | Schema Design      | ✅     | `prisma/schema.prisma`, `/docs/database/schema.md`                     | Complete - Full schema with 12 tables, ER diagram, indexes, and documentation |
| 103 | Seed Data          | ⬚      | `/seeds/` or `/fixtures/`                                              |                                                                               |

### Phase 2: Backend

| SOP | Title          | Status | Output Location                      | Notes |
| --- | -------------- | ------ | ------------------------------------ | ----- |
| 200 | API Design     | ⬚      | `/docs/api/openapi.yaml`             |       |
| 201 | Authentication | ⬚      | Auth module/routes                   |       |
| 202 | Authorization  | ⬚      | `/docs/authorization.md`, middleware |       |
| 203 | Error Handling | ⬚      | Error handler module                 |       |
| 204 | Validation     | ⬚      | Validation schemas                   |       |

### Phase 3: Frontend

| SOP | Title                  | Status | Output Location              | Notes |
| --- | ---------------------- | ------ | ---------------------------- | ----- |
| 300 | Component Architecture | ⬚      | `/src/components/` structure |       |
| 301 | Styling Standards      | ⬚      | Style configs, design tokens |       |
| 302 | API Integration        | ⬚      | API client module            |       |
| 303 | Form Handling          | ⬚      | Form components/hooks        |       |

### Phase 4: AI Integration (If Applicable)

| SOP | Title           | Status | Output Location           | Notes |
| --- | --------------- | ------ | ------------------------- | ----- |
| 400 | AI Feasibility  | ⬚      | `/docs/ai-feasibility.md` |       |
| 401 | LLM Integration | ⬚      | AI service module         |       |
| 404 | AI Testing      | ⬚      | AI test suite             |       |
| 405 | Cost Monitoring | ⬚      | Cost tracking setup       |       |

### Phase 5: Quality

| SOP | Title               | Status | Output Location                    | Notes |
| --- | ------------------- | ------ | ---------------------------------- | ----- |
| 500 | Unit Testing        | ⬚      | Test configuration, `/tests/unit/` |       |
| 501 | Integration Testing | ⬚      | `/tests/integration/`              |       |
| 503 | Code Review         | ⬚      | PR template, review checklist      |       |
| 504 | Security Audit      | ⬚      | Security scan configs              |       |

### Phase 6: Deployment

| SOP | Title                 | Status | Output Location                    | Notes |
| --- | --------------------- | ------ | ---------------------------------- | ----- |
| 602 | Container Standards   | ⬚      | `Dockerfile`, `docker-compose.yml` |       |
| 603 | Deployment Strategy   | ⬚      | `/docs/deployment.md`              |       |
| 604 | Monitoring & Alerting | ⬚      | Monitoring configs                 |       |
| 605 | Incident Response     | ⬚      | `/docs/incident-response.md`       |       |

**Status Legend:**

- ⬚ Not Started
- 🔄 In Progress
- ✅ Complete
- ⏭️ Skipped (not applicable)

---

## 🔄 Current Session

### Active SOP

**SOP:** SOP-102
**Title:** Seed Data
**Status:** ⬚ Not Started

### Context Files to Read

```
.sops/phase-1-database/SOP-102-seed-data.md
prisma/schema.prisma
/docs/requirements.md
```

### Expected Outputs

- [ ] `prisma/seed.ts` — Seed script
- [ ] `prisma/seed-data.ts` — Seed constants (optional)
- [ ] `/docs/database/seed-data.md` — Seed documentation
- [ ] Seed command configured in package.json
- [ ] Test fixtures

---

## 📝 Session Prompt Template

```markdown
## Context

I'm working on Listly - Smart Shopping Companion: Mobile-first PWA for smart shopping list management with real-time collaboration, AI suggestions, and pantry tracking.

**Project location:** /home/eima40x4c/Projects/listly
**Session tracker:** `.prompts/AI-SESSION.md`
**SOPs location:** `.sops/`

## Completed Work

The following SOPs have been completed:

- Phase 0: Initialization (SOPs 000-006)
  - Requirements Gathering, Tech Stack, Repository Setup, Project Structure
  - Environment Setup, Design Patterns, Code Style Standards
- Phase 1: Database
  - SOP-100 (Database Selection): PostgreSQL 16 + Supabase + Prisma

## Current Task

Execute **SOP-102** (Seed Data).

**Read these files:**

1. `.sops/phase-1-database/SOP-102-seed-data.md` — The procedure
2. `prisma/schema.prisma` — Database schema
3. `/docs/requirements.md` — Data requirements

**Refer to `AI-GUIDE.md` to attend to your responsibilities and for guidance on best practices.**
**Follow the SOP's Procedure section step by step.**
**Create all outputs listed in the SOP's Outputs section.**
**Update `.prompts/AI-SESSION.md` when complete.**
**Update `.sops/templates/project-checklist.md` and check off deliverables**
```

---

## 📓 Session Log

### Session 1 — 2026-02-07

**SOPs Completed:** SOP-000 (Requirements Gathering)
**Files Created:**

- `/docs/requirements.md` — Comprehensive requirements with 29 user stories across 8 epics
  **Notes:**
- Defined 8 epics: Shopping Lists, Collaboration, Budget/Price, AI Suggestions, Pantry/Expiration, Meal Planning, Offline-First, Location Reminders
- MVP scope includes core list management, sharing, real-time sync, basic budget, PWA install
- AI features deferred to Phase 3 to reduce initial complexity
- Location reminders deferred to Phase 4 due to privacy complexity

### Session 2 — 2026-02-08

**SOPs Completed:** SOP-001 (Tech Stack Selection), SOP-002 (Repository Setup)
**Files Created:**

- `/docs/tech-stack.md` — Comprehensive tech stack documentation with decision matrices and rationale
- `.gitignore` — Configured for Next.js/TypeScript with PWA support
- `README.md` — Project overview, features, setup instructions, and tech stack summary
- `CONTRIBUTING.md` — Contribution guidelines with commit conventions and code style standards
- `.github/pull_request_template.md` — Structured PR template for consistent reviews
  **Tech Stack Summary:**
- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes (serverless)
- **Database:** PostgreSQL 16 + Prisma ORM
- **Real-time:** Supabase Realtime
- **Authentication:** NextAuth.js 5
- **State Management:** Zustand
- **PWA:** next-pwa
- **Hosting:** Vercel (frontend) + Supabase (database)
  **Git Setup:**
- Initialized Git repository with `main` as default branch
- Implemented Conventional Commits format (feat, fix, docs, chore, etc.)
- Branch naming convention: feature/, fix/, docs/, chore/, refactor/, test/
- Initial commit: 375dff4 "chore: initial project setup with documentation and git conventions"
  **Notes:**
- Selected T3 Stack pattern (Next.js, TypeScript, Prisma) with Supabase for real-time collaboration
- Cost-optimized for MVP: ~$8/month (only Apple Developer Program), scales to ~$100/month at 500 users
- PWA-first approach with offline support via service workers and IndexedDB
- Real-time collaboration via Supabase Realtime (CDC from PostgreSQL)
- All major categories evaluated with decision matrices: frontend, database, auth, real-time, state management
- Repository ready for development with clear documentation and contribution guidelines

### Session 3 — 2026-02-08

**SOPs Completed:** SOP-003 (Project Structure)
**Files Created:**

- Complete Next.js 14 App Router folder structure with `src/` directory
- `tsconfig.json` — TypeScript configuration with path aliases (@/, @/components/\*, etc.)
- `src/components/ui/index.ts` — Barrel file for UI components
- `src/components/forms/index.ts` — Barrel file for form components
- `src/components/layout/index.ts` — Barrel file for layout components
- `src/components/features/index.ts` — Barrel file for feature components
- `/docs/architecture/project-structure.md` — Comprehensive structure documentation
  **Folder Structure:**
- Created `src/app/` with route groups: `(auth)` for login/register, `(dashboard)` for authenticated routes
- Created `src/app/api/` for API routes
- Created component directories: `ui/`, `forms/`, `layout/`, `features/`
- Created support directories: `lib/`, `hooks/`, `types/`, `services/`, `config/`
- Created `prisma/` directory with `migrations/` subdirectory
- Created `public/` with `images/` and `fonts/` subdirectories
- Created `tests/` with `unit/` and `integration/` subdirectories
- Created `docs/architecture/` and `docs/database/` subdirectories
  **Path Aliases:**
- Configured 7 path aliases for clean imports
- All aliases follow `@/` convention for consistency
  **Documentation:**
- Detailed directory map with purpose and examples
- File naming conventions table with rationale
- Import aliases usage guide
- Module boundaries and design principles
- Next.js App Router specific conventions
  **Notes:**
- Structure follows Next.js 14 App Router conventions
- Supports mobile-first PWA architecture with clear separation of concerns
- Barrel files enable cleaner imports across component directories
- Path aliases eliminate relative import complexity
- Ready for Phase 1 (Database) and environment configuration

### Session 4 — 2026-02-08

**SOPs Completed:** SOP-004 (Environment Setup)
**Files Created:**

- `.env.example` — Template with all environment variables categorized by purpose (Application, Database, Auth, Supabase, OAuth, Email, Real-time, AI, Analytics, Feature Flags)
- `/docs/environment-variables.md` — Comprehensive documentation for all environment variables with setup guides
- `docker-compose.yml` — Docker services configuration for PostgreSQL 16, Redis 7, and optional dev tools (Adminer, Redis Commander, MailHog)
- `scripts/setup.sh` — Automated setup script with prerequisite checks, environment setup, dependency installation, and database initialization
- `package.json` — Complete dependency manifest with development scripts
- `.vscode/settings.json` — Enhanced with editor configuration for formatting, linting, and TypeScript
- `.vscode/extensions.json` — Recommended VS Code extensions list
- `/docs/development-setup.md` — Complete development setup guide with quick start, manual setup, troubleshooting, and workflow documentation
  **Environment Configuration:**
- 50+ environment variables documented with examples and requirements
- Support for NextAuth.js 5, Supabase (database/auth/storage/realtime), Pusher, Resend, Sentry, OpenAI
- Feature flags for gradual feature rollout (AI suggestions, voice input, meal planner, price tracking)
- Environment-specific configurations (development, staging, production)
  **Docker Services:**
- PostgreSQL 16 Alpine with health checks and data persistence
- Redis 7 Alpine for caching and session management
- Optional development tools (Adminer for DB management, Redis Commander, MailHog for email testing)
- Proper networking and volume management
  **Development Scripts:**
- `pnpm dev`, `pnpm build`, `pnpm start` for Next.js development
- `pnpm db:migrate`, `pnpm db:studio`, `pnpm db:seed` for database management
- `pnpm docker:up`, `pnpm docker:down`, `pnpm docker:logs` for Docker management
- `pnpm lint:fix`, `pnpm format`, `pnpm type-check` for code quality
- `pnpm test`, `pnpm test:coverage`, `pnpm test:e2e` for testing
  **Setup Script Features:**
- Prerequisites validation (Node.js, pnpm, Docker)
- Auto-installs pnpm if missing
- Creates `.env` from template with auto-generated `NEXTAUTH_SECRET`
- Installs dependencies with pnpm
- Starts Docker services with health checks
- Waits for database readiness
- Runs Prisma migrations and generates client
- Color-coded output with helpful next steps
  **VS Code Configuration:**
- Format on save, auto-fix ESLint, organize imports
- Tailwind CSS IntelliSense configuration
- Prisma schema support
- Consistent editor settings (2-space tabs, LF line endings)
- Search/file exclusions for better performance
  **Documentation:**
- Quick start guide (automated setup in minutes)
- Manual setup guide (step-by-step instructions)
- Troubleshooting section (10+ common issues with solutions)
- Development workflow best practices
- Alternative database setup options (local PostgreSQL, Supabase cloud)
- Security best practices and checklist
  **Dependencies:**
- Frontend: Next.js 14, React 18, TypeScript 5
- UI: Tailwind CSS, shadcn/ui (Radix UI), Lucide icons
- State: Zustand 4
- Forms: React Hook Form 7, Zod 3
- Database: Prisma 5, PostgreSQL via @prisma/client
- Auth: NextAuth.js 5 with Prisma adapter
- Real-time: Supabase client, Pusher (alternative)
- Email: Resend 3
- Error tracking: Sentry 8
- Testing: Jest 29, Playwright, Testing Library
- Dev tools: ESLint, Prettier, Husky, lint-staged
  **Notes:**
- Complete development environment ready for immediate use
- Supports both Docker and cloud-based workflows
- Comprehensive documentation eliminates setup friction
- Automated script reduces setup time from 30+ minutes to 2-3 minutes
- Feature flags enable progressive feature rollout
- Security best practices enforced (secrets not committed, unique per environment)
- Ready for SOP-005 (Design Patterns)

### Session 5 — 2026-02-08

**SOPs Completed:** SOP-005 (Design Patterns)
**Files Created:**

- `/docs/architecture/patterns.md` — Comprehensive design patterns documentation (130+ KB)
  **Design Decisions:**
- **Architectural Pattern:** Modular Monolith (selected over microservices)
  - Best fit for small team size (1-2 developers)
  - Critical time to market (MVP launch)
  - Progressive scalability (Vercel handles horizontal scaling)
  - Clear domain boundaries (lists, pantry, AI, collaboration)
- **Application Layer:** Feature-Based Organization
  - Features organized in `src/features/` with self-contained modules
  - Each feature contains: components/, hooks/, services/, types.ts
  - Clear dependency flow: App Router → Features → Lib/Shared
- **Data Access:** Repository Pattern
  - Centralized database operations in `src/lib/repositories/`
  - Clean interface for Prisma queries
  - Easy to mock for testing
  - Example repositories: list.repository.ts, item.repository.ts, user.repository.ts
- **Business Logic:** Service Pattern
  - Feature-specific services in `src/features/[feature]/services/`
  - Encapsulates complex workflows (e.g., complete shopping trip)
  - Coordinates multiple repositories and external services
  - Example: listService.createList(), listService.addItem(), listService.shareList()
- **React State:** Custom Hooks Pattern
  - Reusable stateful logic in hooks (useShoppingList, useRealtimeList)
  - Separates data fetching from UI components
  - React Query integration for server state management
    **Component Patterns:**
- **Container/Presenter:** Separates logic (Container) from UI (Presenter)
- **Compound Components:** Flexible component APIs with shared context (e.g., Card.Header, Card.Body)
- **Render Props:** Share code via function props for customizable rendering
  **Additional Patterns:**
- **Factory Pattern:** Object creation for notifications (email, push)
- **Strategy Pattern:** Interchangeable algorithms for AI suggestions
- **Custom Error Classes:** Structured error handling (NotFoundError, UnauthorizedError, ValidationError)
  **Documentation Includes:**
- Architectural pattern evaluation and decision matrix
- Complete feature-based folder structure with 6 feature modules
- Repository pattern implementation with base interfaces
- Service pattern implementation with real-world examples
- Custom hooks implementation with React Query
- Component patterns with TypeScript code examples
- Factory and Strategy patterns for flexible implementations
- Error handling patterns with custom error classes
- Testing patterns for repositories and services
- Pattern selection guidelines (when to use each pattern)
- Anti-patterns to avoid (God components, prop drilling, etc.)
  **Notes:**
- 1000+ lines of comprehensive pattern documentation
- Modular Monolith allows future extraction to microservices if needed
- Feature-based organization aligns with Next.js 14 App Router
- Repository + Service pattern creates clean separation of concerns
- All patterns include TypeScript examples specific to Listly domain
- Ready for SOP-006 (Code Style Standards)

### Session 6 — 2026-02-08

**SOPs Completed:** SOP-006 (Code Style Standards)
**Files Created:**

- `eslint.config.js` — ESLint 9+ flat configuration with TypeScript, React, and Prettier integration
- `prettier.config.js` — Prettier configuration with Tailwind CSS plugin
- `.prettierignore` — Prettier exclusion patterns
- `lint-staged.config.js` — Staged file linting configuration
- `.husky/pre-commit` — Git pre-commit hook for automated linting
- Updated `package.json` — Updated lint and format scripts
- Updated `.vscode/settings.json` — Disabled organize imports on save (ESLint handles it)

**Code Style Configuration:**

- **ESLint:** TypeScript, React Hooks, Import Sorting, Prettier integration
  - Rules: no-unused-vars with `_` prefix exception, explicit-any warning, consistent-type-imports
  - React hooks rules and exhaustive-deps warning
  - Simple-import-sort for automatic import organization
  - No console warnings (except warn/error)
- **Prettier:** 80 char line width, single quotes, 2-space tabs, trailing commas (ES5), LF line endings
  - Tailwind CSS plugin for class sorting
- **Import Organization:** Automatic sorting (React/Next.js → External → Internal → Relative)
- **Git Hooks:** Pre-commit hook runs lint-staged for auto-fix on commit
- **VS Code:** Format on save, ESLint auto-fix, Prettier as default formatter

**Naming Conventions:**

- Variables: camelCase (`userName`, `isLoading`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- Functions: camelCase with verb prefix (`getUserById`, `handleSubmit`)
- Classes/Interfaces/Types: PascalCase (no "I" prefix for interfaces)
- Components: PascalCase (`UserCard`, `NavBar`)
- Hooks: camelCase with "use" prefix (`useAuth`, `useUsers`)
- Files: Components use PascalCase, utilities use kebab-case

**Notes:**

- ESLint plugins installed: prettier, import, simple-import-sort, react, react-hooks
- Lint-staged ensures only changed files are linted on commit
- Husky pre-commit hook prevents non-compliant code from being committed
- Ready for Phase 1 (Database) — SOP-100 (Database Selection)

### Session 7 — 2026-02-09

**SOPs Completed:** SOP-100 (Database Selection)
**Files Created:**

- `/docs/database/database-decision.md` — Comprehensive database decision documentation (22KB)
- Updated `/docs/tech-stack.md` — Added link to detailed database decision with key benefits

**Database Selection:**

- **Database:** PostgreSQL 16 (perfect fit for relational data with complex relationships)
- **Hosting:** Supabase (free tier: 500MB, 50k MAU, built-in real-time via CDC)
- **ORM:** Prisma 5 (type-safe queries, excellent DX, seamless migrations)
- **Real-Time:** Supabase Realtime using PostgreSQL Change Data Capture
- **Offline Strategy:** IndexedDB + Service Worker for offline queue

**Decision Matrix Scores:**

- PostgreSQL: 4.85/5 (weighted score)
- MongoDB: 3.50/5
- SQLite: 3.55/5

**Key Rationale:**

- Highly structured relational data (Users → Lists → Items → History)
- Complex query requirements (JOINs, aggregations for price trends and analytics)
- ACID transactions critical for budget tracking and collaboration consistency
- Row-Level Security (RLS) for secure multi-tenant data isolation
- Supabase provides integrated auth, storage, and real-time in one platform
- Cost-effective: $0/month for MVP (0-500 users), $25/month growth (500-5k users)

**Documentation Includes:**

- Complete data requirements analysis from requirements.md
- Decision matrix with weighted criteria (7 factors)
- Detailed PostgreSQL, Supabase, and Prisma rationale
- Real-time strategy using CDC (handles US-007: <2s sync requirement)
- Offline strategy for PWA (handles US-024, US-025)
- Cost projections for MVP, growth, and scale phases
- Security considerations (RLS policies, connection security)
- Performance optimization (indexing strategy, query optimization)
- Testing strategy (unit, integration, seed data)
- Backup and disaster recovery plan
- Migration path if we outgrow Supabase
- Implementation checklist

**Notes:**

- Database selection confirmed PostgreSQL decision from SOP-001
- Added comprehensive 22KB documentation with implementation details
- Ready for SOP-101 (Schema Design)

### Session 8 — 2026-02-09

**SOPs Completed:** SOP-101 (Schema Design)
**Files Created:**

- `prisma/schema.prisma` — Complete Prisma schema with 12 tables and 5 enums
- `/docs/database/schema.md` — Comprehensive schema documentation (37KB)

**Database Schema:**

- **12 Tables:** users, user_preferences, shopping_lists, list_items, list_collaborators, categories, stores, store_categories, user_favorite_stores, item_history, pantry_items, recipes, recipe_ingredients, meal_plans
- **5 Enums:** AuthProvider, ListStatus, CollaboratorRole, ItemAction, MealType
- **Key Features:** Third Normal Form (3NF), CUID primary keys, proper foreign keys with CASCADE/SET NULL, strategic indexes for query optimization

**Entity Relationships:**

- User-centric: Users own lists, pantry items, recipes, meal plans
- Collaboration: Many-to-many via ListCollaborator with role-based permissions
- Categorization: Items and pantry items categorized, stores have custom category mappings
- Historical tracking: ItemHistory denormalizes item_name for price tracking
- Meal planning: Recipes with ingredients, meal plans link to recipes

**Documentation Includes:**

- Complete ER diagram in Mermaid format (all 12 tables with relationships)
- Detailed table specifications (all columns with types, constraints, descriptions)
- All indexes with purpose explanations
- Relationship diagrams and explanations
- Normalization level (3NF) with rationale
- Referential integrity rules (CASCADE/SET NULL strategies)
- Common query patterns with SQL examples
- Performance considerations (read/write optimization, scalability)
- Data retention and archival policies
- Security considerations (RLS, sensitive data handling)
- Future enhancement roadmap

**Strategic Indexes:**

- User lookups: email, (provider, provider_id)
- List operations: owner_id, status, created_at
- Item sorting: (list_id, sort_order)
- Price history: (store_id, item_name, created_at) for trend analysis
- Pantry management: expiration_date, barcode, location
- Meal planning: (user_id, date) for calendar queries
- Location features: (latitude, longitude) for store proximity

**Normalization & Integrity:**

- All tables in 3NF (no partial or transitive dependencies)
- Denormalization exception: item_history.item_name for historical data preservation
- CASCADE deletes for owned data (user deletion cascades to all user data)
- SET NULL for optional relationships (store deletion preserves lists)

**Notes:**

- Schema supports all MVP features from requirements (US-001 through US-026)
- Real-time collaboration supported via Supabase CDC (change data capture)
- Offline-first compatible (all data can be synced via Prisma)
- Price tracking and budget features fully supported via item_history
- Pantry inventory with expiration tracking ready for Phase 2
- Meal planning with recipe integration ready for Phase 3
- 37KB comprehensive documentation with examples
- Ready for SOP-102 (Seed Data) or Phase 2 (Backend)

---

## 🔗 Quick Reference

### Directory Structure

```
{project-root}/
├── .prompts/
│   ├── AI-GUIDE.md       # How to use SOPs with AI agents
│   └── AI-SESSION.md     # This file (active session tracker)
├── .sops/
│   ├── README.md         # SOP index
│   ├── templates/        # Reusable templates
│   ├── phase-0-initialization/
│   ├── phase-1-database/
│   ├── phase-2-backend/
│   ├── phase-3-frontend/
│   ├── phase-4-ai-integration/
│   ├── phase-5-quality/
│   └── phase-6-deployment/
├── docs/                 # Generated documentation
├── src/                  # Source code
└── ...
```

### Recommended SOP Order

```
Phase 0 (Sequential)
────────────────────
000 → 001 → 002 → 003 → 004 → 005 → 006

Phase 1-3 (Can parallelize frontend/backend after DB)
──────────────────────────────────────────────────────
100 → 101 → 103
            ↓
      ┌─────┴─────┐
      ↓           ↓
    Phase 2    Phase 3
    (Backend)  (Frontend)
      ↓           ↓
      └─────┬─────┘
            ↓
    Phase 4 (Optional)
            ↓
    Phase 5 (Quality)
            ↓
    Phase 6 (Deploy)
```

---

## ⚠️ Important Notes

1. **AI manages this file** — Human only provides initial project description
2. **Always read SOPs first** — Don't assume; follow the documented procedure
3. **Check prerequisites** — Ensure previous SOP outputs exist before starting
4. **Update after each SOP** — Keep this tracker current
5. **Document deviations** — Note any departures from SOPs in the session log
