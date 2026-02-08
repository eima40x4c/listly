# SOP-004: Environment Setup

## Purpose

Establish a consistent, secure, and reproducible development environment configuration. This ensures all team members can run the project locally with the same settings and secrets are properly managed.

---

## Scope

- **Applies to:** All projects requiring environment configuration
- **Covers:** Environment variables, local development setup, Docker/containers
- **Does not cover:** CI/CD configuration, production deployment

---

## Prerequisites

- [ ] SOP-002 (Repository Setup) completed
- [ ] SOP-003 (Project Structure) completed
- [ ] Development tools installed (Node.js, Python, Docker, etc.)

---

## Procedure

### 1. Identify Required Environment Variables

Categorize variables by purpose:

| Category | Examples |
|----------|----------|
| **Database** | `DATABASE_URL`, `DB_HOST`, `DB_PASSWORD` |
| **Authentication** | `JWT_SECRET`, `OAUTH_CLIENT_ID`, `SESSION_SECRET` |
| **Third-party APIs** | `STRIPE_SECRET_KEY`, `SENDGRID_API_KEY` |
| **Application** | `NODE_ENV`, `APP_URL`, `PORT` |
| **Feature Flags** | `ENABLE_FEATURE_X`, `DEBUG_MODE` |

### 2. Create .env.example

Create a template with all variables (no real secrets):

```bash
# ===========================================
# Application
# ===========================================
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# ===========================================
# Database
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# ===========================================
# Authentication
# ===========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ===========================================
# Third-party Services
# ===========================================
# Email
RESEND_API_KEY=

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# ===========================================
# Development Only
# ===========================================
DEBUG=false
```

### 3. Document Environment Variables

Create `/docs/environment-variables.md`:

```markdown
# Environment Variables

## Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` | ✅ |
| `NEXTAUTH_SECRET` | Session encryption key | Random 32-char string | ✅ |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` | ✅ |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DEBUG` | Enable debug logging | `false` |

## Generating Secrets

```bash
# Generate a secure secret
openssl rand -base64 32

# Generate a UUID
uuidgen
```

## Environment-Specific Values

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | `development` | `staging` | `production` |
| `APP_URL` | `http://localhost:3000` | `https://staging.app.com` | `https://app.com` |
```

### 4. Set Up Local Development Database

**Option A: Docker Compose (Recommended)**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ${PROJECT_NAME:-app}_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-appdb}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Optional: Redis for caching/sessions
  redis:
    image: redis:7-alpine
    container_name: ${PROJECT_NAME:-app}_redis
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

**Option B: Cloud Development Database**

Use services like:
- Supabase (free tier)
- Railway (free tier)
- PlanetScale (free tier)

### 5. Create Setup Script

Create `scripts/setup.sh` (or use package.json scripts):

```bash
#!/bin/bash

echo "🚀 Setting up development environment..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting."; exit 1; }

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your local settings"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start database
echo "🐘 Starting database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 3

# Run migrations
echo "🔄 Running database migrations..."
pnpm db:migrate

# Seed database (optional)
echo "🌱 Seeding database..."
pnpm db:seed

echo "✅ Setup complete! Run 'pnpm dev' to start the development server."
```

### 6. Add Development Scripts to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "setup": "bash scripts/setup.sh",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

### 7. Configure IDE Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

Create `.vscode/extensions.json` (recommended extensions):

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

### 8. Document Local Setup

Add to `README.md` or create `docs/development-setup.md`:

```markdown
# Development Setup

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose
- Git

## Quick Start

```bash
# Clone and enter project
git clone {repo-url}
cd {project-name}

# Run setup script
pnpm setup

# Start development server
pnpm dev
```

## Manual Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start database:**
   ```bash
   docker-compose up -d postgres
   ```

4. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Start dev server:**
   ```bash
   pnpm dev
   ```

## Common Issues

### Database connection refused
Ensure Docker is running and the container is up:
```bash
docker-compose ps
docker-compose up -d postgres
```

### Port already in use
Change the port in `.env`:
```
PORT=3001
```
```

---

## Review Checklist

- [ ] `.env.example` created with all variables
- [ ] Environment variables documented
- [ ] Docker Compose configured (if using containers)
- [ ] Setup script created
- [ ] Package.json scripts defined
- [ ] VS Code settings configured
- [ ] Development setup documented
- [ ] Secrets are not committed to repository

---

## AI Agent Prompt Template

```
Set up the development environment for this project.

Read `/docs/tech-stack.md` for technology context.

Execute SOP-004 (Environment Setup):
1. Create .env.example with all required variables
2. Create docker-compose.yml for local database
3. Add setup scripts to package.json
4. Create VS Code settings
5. Document setup in /docs/development-setup.md
```

---

## Outputs

- [ ] `.env.example` — Environment variable template
- [ ] `/docs/environment-variables.md` — Variable documentation
- [ ] `docker-compose.yml` — Local services configuration
- [ ] `.vscode/settings.json` — IDE configuration
- [ ] `/docs/development-setup.md` — Setup instructions
- [ ] Setup scripts in package.json

---

## Related SOPs

- **SOP-002:** Repository Setup (base repository)
- **SOP-003:** Project Structure (folder organization)
- **SOP-006:** Code Style Standards (VS Code settings alignment)

---

## Security Reminders

| Do | Don't |
|----|-------|
| Use `.env.example` for templates | Commit `.env` with real secrets |
| Generate unique secrets per environment | Reuse secrets across environments |
| Document how to generate secrets | Share secrets in chat/email |
| Use secret managers in production | Store production secrets in code |
