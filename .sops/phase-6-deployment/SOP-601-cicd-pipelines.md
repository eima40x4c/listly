# SOP-601: CI/CD Pipelines

## Purpose

Establish continuous integration and continuous deployment pipelines to automate testing, building, and deploying the application. Good CI/CD ensures consistent quality and enables rapid, reliable releases.

---

## Scope

- **Applies to:** All code deployments
- **Covers:** GitHub Actions setup, build pipelines, deployment automation
- **Does not cover:** Infrastructure provisioning, Kubernetes configuration

---

## Prerequisites

- [ ] SOP-500/501 (Testing) — tests configured
- [ ] SOP-600 (Environment Config) — environments defined
- [ ] Repository hosted on GitHub
- [ ] Deployment target selected (Vercel, Railway, etc.)

---

## Procedure

### 1. CI/CD Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │  Push   │───▶│  Test   │───▶│  Build  │───▶│ Deploy  │       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │  Lint   │    │  Unit   │    │ Docker  │    │ Preview │       │
│  │ Format  │    │  Integ  │    │  Image  │    │  Prod   │       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Create GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ===================
  # Lint & Type Check
  # ===================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

  # ===================
  # Unit Tests
  # ===================
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test:run

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  # ===================
  # Integration Tests
  # ===================
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run migrations
        run: pnpm prisma db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          NEXTAUTH_SECRET: test-secret-for-ci

  # ===================
  # Build
  # ===================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          # Provide dummy values for build
          DATABASE_URL: postgresql://localhost:5432/dummy
          NEXTAUTH_SECRET: build-time-secret
          NEXT_PUBLIC_APP_URL: https://example.com

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/
          retention-days: 7
```

### 3. Deployment Workflow (Vercel)

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run post-deploy migrations
        run: |
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 4. Preview Deployments

```yaml
# .github/workflows/preview.yml

name: Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy Preview to Vercel
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Comment Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `🚀 Preview deployed to: ${{ steps.vercel-deploy.outputs.preview-url }}`
            })
```

### 5. Database Migrations in CI

```yaml
# .github/workflows/migrate.yml

name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    name: Run Migrations
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: '8'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify success
        if: success()
        run: echo "✅ Migrations completed successfully"

      - name: Notify failure
        if: failure()
        run: echo "❌ Migration failed"
```

### 6. Docker Build Pipeline

```yaml
# .github/workflows/docker.yml

name: Docker Build

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 7. Multi-Stage Dockerfile

```dockerfile
# Dockerfile

# ===================
# Base Stage
# ===================
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@8 --activate
WORKDIR /app

# ===================
# Dependencies Stage
# ===================
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ===================
# Build Stage
# ===================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ===================
# Production Stage
# ===================
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 8. Release Workflow

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest --strip header

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') }}
```

### 9. Scheduled Jobs

```yaml
# .github/workflows/scheduled.yml

name: Scheduled Jobs

on:
  schedule:
    # Daily at 3 AM UTC
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  # Database backup
  backup:
    name: Database Backup
    runs-on: ubuntu-latest
    steps:
      - name: Backup database
        run: |
          # Add your backup script here
          echo "Running database backup..."

  # Dependency updates check
  dependencies:
    name: Check Dependencies
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Check for updates
        run: |
          npx npm-check-updates -u --target minor
          git diff --exit-code || echo "Updates available"

  # Security scan
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run security audit
        run: pnpm audit --audit-level=moderate
```

### 10. Branch Protection Rules

Configure in GitHub repository settings:

```yaml
# Documented for reference (configure in UI)

branches:
  main:
    protection:
      required_status_checks:
        strict: true
        contexts:
          - lint
          - test-unit
          - build
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
      enforce_admins: false
      required_linear_history: true
```

---

## Review Checklist

- [ ] CI workflow runs on PRs
- [ ] Unit tests run in CI
- [ ] Integration tests with DB service
- [ ] Build verification
- [ ] Preview deployments for PRs
- [ ] Production deployment workflow
- [ ] Database migration strategy
- [ ] Docker build (if applicable)
- [ ] Branch protection configured
- [ ] Secrets stored securely

---

## AI Agent Prompt Template

```
Set up CI/CD pipelines for this project.

Read:
- `package.json` for scripts
- `.github/` for existing workflows
- Deployment target requirements

Execute SOP-601 (CI/CD Pipelines):
1. Create CI workflow with lint, test, build
2. Set up preview deployments
3. Create production deployment workflow
4. Add database migration workflow
5. Configure branch protection
```

---

## Outputs

- [ ] `.github/workflows/ci.yml` — Main CI pipeline
- [ ] `.github/workflows/deploy.yml` — Production deployment
- [ ] `.github/workflows/preview.yml` — Preview deployments
- [ ] `.github/workflows/migrate.yml` — Database migrations
- [ ] `Dockerfile` — Container build (if needed)
- [ ] Branch protection configured

---

## Related SOPs

- **SOP-500/501:** Testing (test configuration)
- **SOP-600:** Environment Config (secrets)
- **SOP-602:** Monitoring (deployment verification)

---

## Pipeline Performance Tips

| Optimization       | Impact                |
| ------------------ | --------------------- |
| Parallel jobs      | Faster total time     |
| Dependency caching | Faster installs       |
| Artifact reuse     | Avoid rebuilding      |
| Conditional runs   | Skip unnecessary jobs |
| Concurrency limits | Cancel stale runs     |
