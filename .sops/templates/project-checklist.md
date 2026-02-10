# Project Initialization Checklist

> **Project Name:** Listly - Smart Shopping Companion
> **Start Date:** 2026-02-07
> **Lead Developer:** AI Agent
> **Target Completion:** TBD

---

## Phase 0: Initialization

### Requirements & Planning

- [x] Stakeholder requirements documented (SOP-000)
- [x] User stories written with acceptance criteria
- [x] MVP scope defined and approved
- [ ] Timeline and milestones established

### Tech Stack Selection (SOP-001)

- [x] Programming language(s) selected: TypeScript
- [x] Framework(s) selected: Next.js 14 (React 18)
- [x] Database type selected: PostgreSQL 16
- [x] Hosting/deployment platform selected: Vercel + Supabase
- [x] Decision rationale documented

### Repository Setup (SOP-002)

- [x] Repository created
- [x] Branch protection rules configured
- [x] `.gitignore` configured for tech stack
- [x] `README.md` with project overview
- [x] `CONTRIBUTING.md` with guidelines
- [x] Commit message format documented

### Project Structure (SOP-003)

- [x] Folder structure created per SOP-003
- [x] Naming conventions documented
- [x] Module boundaries defined

### Environment Setup (SOP-004)

- [x] `.env.example` template created
- [x] Local development instructions documented
- [x] Required tools/versions listed
- [x] Dev container configured (if applicable)

### Design Patterns (SOP-005)

- [x] Architectural pattern selected: Modular Monolith
  - [x] MVC / MVVM / Clean Architecture / Other
- [x] Code-level patterns identified:
  - [x] Repository Pattern (data access)
  - [x] Service Pattern (business logic)
  - [x] Factory Pattern (object creation)
  - [x] Other: Feature-Based Organization, Server Actions Pattern
- [x] Pattern usage documented in `/docs/architecture/`

### Code Style Standards (SOP-006)

- [x] Linter configured: ESLint with TypeScript, React, Import Sorting
- [x] Formatter configured: Prettier with Tailwind CSS plugin
- [x] Pre-commit hooks set up
- [x] Style guide documented or linked

---

## Phase 1: Database & Data Layer

### Database Selection (SOP-100)

- [x] Database engine selected: **PostgreSQL 16**
- [x] Hosting provider selected: **Supabase**
- [x] ORM/Query builder selected: **Prisma 5**
- [x] Justification documented in `/docs/database/database-decision.md`
- [x] Real-time strategy documented: Supabase Realtime (PostgreSQL CDC)
- [x] Offline strategy documented: IndexedDB + Service Worker
- [x] Cost projections documented for MVP and scaling
- [ ] Local database setup instructions added (pending SOP-101)

### Schema Design (SOP-101)

- [x] ERD diagram created
- [x] Table naming follows conventions
- [x] Primary/foreign keys defined
- [x] Indexes planned for query patterns
- [x] Schema reviewed by team member

### Seed Data (SOP-102)

- [x] Seed script created
- [x] Test data covers edge cases
- [x] Seed data is anonymized (no real PII)

---

## Phase 2: API & Backend

### API Design (SOP-200)

- [x] API specification created (OpenAPI/Swagger)
- [x] Endpoints follow RESTful conventions
- [x] Versioning strategy defined
- [x] Rate limiting considered
- [x] 12 resources identified and mapped
- [x] 60+ endpoints designed with proper HTTP methods
- [x] Standard response format defined (success/error wrappers)
- [x] Pagination strategy defined (page, limit, meta)
- [x] Query parameters documented (filtering, sorting, searching)
- [x] Authentication strategy defined (Bearer JWT)
- [x] OpenAPI 3.0.3 specification created
- [x] Comprehensive endpoint documentation

### Authentication (SOP-201)

- [x] Auth method selected: **NextAuth.js v5 with JWT sessions**
- [x] OAuth providers configured: **Google (primary), Apple (primary), GitHub (optional)**
- [x] Email/password credentials implemented as **fallback**
- [x] Token management implemented
- [x] Password hashing configured (bcryptjs, 12 rounds)
- [x] Session/token expiry defined (30 days with 24h refresh)
- [x] Password validation rules enforced (8+ chars, uppercase, lowercase, number)
- [x] Registration endpoint created (email/password fallback)
- [x] OAuth sign-in events sync provider info to User model
- [x] Protected route utilities created (server & API)
- [x] Client-side session hooks created (signInWithGoogle, signInWithApple, signInWithCredentials)
- [x] Type definitions for NextAuth extended
- [x] SessionProvider component created

### Authorization (SOP-202)

- [x] Roles defined: **VIEWER, EDITOR, ADMIN, owner (pseudo-role)**
- [x] Permission matrix documented
- [x] Route protection implemented (server & client utilities)
- [x] Authorization middleware created (getListRole, requireListAccess, etc.)
- [x] Permission utilities created (13+ functions for role checks)
- [x] Ownership checking utilities created (for user-scoped resources)
- [x] Client permission hooks created (useListPermissions, useItemPermissions)
- [x] API authorization patterns documented
- [x] Security best practices documented (404 for unauthorized access)
- [x] Resource-based authorization (ownership + collaboration)
- [x] No system-wide admin roles (aligns with household app design)

### Error Handling (SOP-203)

- [x] Standard error response format defined
- [x] Error codes documented
- [x] Logging configured
- [x] User-friendly messages for common errors
- [x] Custom error classes created (AppError, ValidationError, etc.)
- [x] Error handler utility implemented
- [x] Request ID generation for tracing
- [x] Prisma error mapping configured
- [x] Error documentation created (docs/api/errors.md)
- [x] Request wrapper with error handling (withErrorHandling)

### Validation (SOP-204)

- [x] Input validation library selected: **Zod**
- [x] Request schemas defined (9 resource schemas + common + pagination)
- [x] Sanitization for user inputs (trim, lowercase, coercion)
- [x] Common field schemas created (email, password, price, etc.)
- [x] Resource-specific schemas:
  - [x] User (register, login, update, preferences)
  - [x] Shopping List (create, update, query, duplicate)
  - [x] List Item (create, update, bulk operations, reorder)
  - [x] Collaborator (add, update role, respond to invitation)
  - [x] Category (create, update, query, reorder)
  - [x] Store (create, update, query, store categories)
  - [x] Pantry Item (create, update, query, expiration tracking)
  - [x] Recipe (create, update, query, ingredients)
  - [x] Meal Plan (create, update, query, generate shopping lists)
- [x] Pagination schema with helpers
- [x] Validation utilities (validateBody, validateQuery, validateParams)
- [x] Type-safe validation with automatic type inference
- [x] Consistent error response format

---

## Phase 3: Frontend

### Component Architecture (SOP-300)

- [x] Component structure defined
- [x] Component folder structure created (ui, layout, forms, features)
- [x] Base UI components created:
- [x] Layout components created:
- [x] Form components created:
- [x] Barrel exports configured for all categories
- [x] Component documentation created (docs/components/README.md)
- [x] Server vs Client component patterns documented
- [x] Utility functions created (cn, formatPrice, debounce, etc.)

### Styling Standards (SOP-301)

- [ ] CSS methodology selected: \***\*\*\*\*\***\_\***\*\*\*\*\***
- [ ] Design tokens/variables defined
- [ ] Responsive breakpoints set
- [ ] Accessibility basics covered (WCAG 2.1 AA)

### API Integration (SOP-302)

- [ ] API client/wrapper created
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Caching strategy defined (if needed)

### Form Handling (SOP-303)

- [ ] Form library selected (if any)
- [ ] Validation feedback patterns
- [ ] Submission loading states

### Progressive Web App (SOP-304) — _Optional_

- [ ] PWA required for this project: ☐ Yes / ☐ No
- [ ] Service worker configured (Serwist/next-pwa)
- [ ] Web manifest with icons
- [ ] Offline caching strategy defined
- [ ] Mobile UI patterns implemented:
  - [ ] Bottom navigation
  - [ ] Touch targets ≥ 48px
  - [ ] Safe area insets
- [ ] Native APIs needed:
  - [ ] Geolocation
  - [ ] Camera/Barcode
  - [ ] Push notifications
  - [ ] Share API
- [ ] Install prompt handled
- [ ] Lighthouse PWA score ≥ 90

---

## Phase 4: AI Integration (If Applicable)

- [ ] AI use case validated (SOP-400)
- [ ] LLM provider selected (SOP-401)
- [ ] Prompt templates documented
- [ ] AI response validation implemented
- [ ] Cost tracking configured (SOP-403)

---

## Phase 5: Quality Assurance

### Unit Testing (SOP-500)

- [ ] Test framework configured
- [ ] Coverage threshold set: **\_**%
- [ ] Critical paths identified for testing

### Integration Testing (SOP-501)

- [ ] Integration test setup complete
- [ ] API contract tests written
- [ ] Database integration tests written

### Code Review (SOP-502)

- [ ] PR template created
- [ ] Review checklist defined
- [ ] Minimum reviewers set: **\_**

### Security Audit (SOP-503)

- [ ] Dependency scanner configured
- [ ] OWASP Top 10 reviewed
- [ ] Secrets detection enabled
- [ ] No hardcoded credentials

---

## Phase 6: Deployment

### Container Standards (SOP-600)

- [ ] Dockerfile created
- [ ] Multi-stage build (if applicable)
- [ ] Image size optimized
- [ ] Non-root user configured

### Deployment Strategy (SOP-601)

- [ ] Deployment method selected: \***\*\*\*\*\***\_\***\*\*\*\*\***
- [ ] Rollback procedure documented
- [ ] Feature flags considered (if needed)

### Monitoring & Alerting (SOP-602)

- [ ] Health check endpoint created
- [ ] Logging aggregation configured
- [ ] Key metrics identified
- [ ] Alert thresholds set

### Incident Response (SOP-603)

- [ ] Severity levels defined
- [ ] Escalation contacts listed
- [ ] Runbook for common issues

---

## Final Sign-Off

| Role           | Name | Date | Signature |
| -------------- | ---- | ---- | --------- |
| Lead Developer |      |      |           |
| Reviewer       |      |      |           |
| Project Owner  |      |      |           |

---

**Notes:**
_Add any project-specific notes, deviations from SOPs, or lessons learned here._
