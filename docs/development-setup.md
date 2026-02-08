# Development Setup

Complete guide for setting up the Listly development environment locally.

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Minimum Version | Download |
|------|----------------|----------|
| **Node.js** | 18.0.0 or higher | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8.0.0 or higher | `npm install -g pnpm` |
| **Docker** | Latest stable | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | Latest stable | Included with Docker Desktop |
| **Git** | Latest stable | [git-scm.com](https://git-scm.com/) |

### Verify Installation

```bash
node --version    # Should show v18.0.0 or higher
pnpm --version    # Should show 8.0.0 or higher
docker --version  # Should show Docker version
git --version     # Should show Git version
```

---

## Quick Start (Automated Setup)

The easiest way to get started is using the automated setup script:

```bash
# Clone the repository
git clone <repository-url>
cd listly

# Run automated setup
pnpm setup
```

This script will:
- ✅ Check for required tools
- ✅ Install pnpm dependencies
- ✅ Create `.env` from `.env.example`
- ✅ Generate `NEXTAUTH_SECRET`
- ✅ Start Docker containers (PostgreSQL + Redis)
- ✅ Run database migrations
- ✅ Generate Prisma Client

Once complete, start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

---

## Manual Setup

If you prefer to set up manually or the automated script fails:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and set required variables:

```bash
# Generate a secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Keep default for local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/listly?schema=public"
```

See [environment-variables.md](./environment-variables.md) for detailed documentation.

### 3. Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify containers are running
docker-compose ps
```

**Expected output:**
```
NAME               STATUS      PORTS
listly_db         Up          0.0.0.0:5432->5432/tcp
listly_redis      Up          0.0.0.0:6379->6379/tcp
```

### 4. Set Up Database

```bash
# Run migrations
pnpm db:migrate

# Generate Prisma Client
pnpm db:generate

# (Optional) Seed database with sample data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

The app will be available at:
- **App:** [http://localhost:3000](http://localhost:3000)
- **API:** [http://localhost:3000/api](http://localhost:3000/api)

---

## Development Tools

### Prisma Studio (Database UI)

View and edit database records:

```bash
pnpm db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Docker Development Tools

Optional development tools for database and email testing:

```bash
# Start all development tools
docker-compose --profile tools up -d
```

Access tools at:
- **Adminer** (PostgreSQL UI): [http://localhost:8080](http://localhost:8080)
- **Redis Commander**: [http://localhost:8081](http://localhost:8081)
- **MailHog** (Email testing): [http://localhost:8025](http://localhost:8025)

---

## Available Scripts

### Development

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server (after build) |
| `pnpm setup` | Run automated environment setup |

### Code Quality

| Script | Description |
|--------|-------------|
| `pnpm lint` | Check code for linting errors |
| `pnpm lint:fix` | Auto-fix linting errors |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting without modifying files |
| `pnpm type-check` | Run TypeScript type checking |

### Database

| Script | Description |
|--------|-------------|
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes without migration |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:studio` | Open Prisma Studio (database UI) |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:reset` | Reset database and re-run migrations |

### Docker

| Script | Description |
|--------|-------------|
| `pnpm docker:up` | Start Docker containers |
| `pnpm docker:down` | Stop and remove containers |
| `pnpm docker:logs` | View container logs (follow mode) |
| `pnpm docker:tools` | Start optional development tools |

### Testing

| Script | Description |
|--------|-------------|
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:e2e` | Run end-to-end tests with Playwright |

---

## Project Structure

```
listly/
├── .vscode/              # VS Code configuration
│   ├── settings.json     # Editor settings
│   └── extensions.json   # Recommended extensions
├── docs/                 # Documentation
│   ├── requirements.md
│   ├── tech-stack.md
│   ├── environment-variables.md
│   └── development-setup.md (this file)
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Migration history
├── public/               # Static assets
├── scripts/              # Development scripts
│   └── setup.sh          # Automated setup script
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth routes (login, register)
│   │   ├── (dashboard)/  # Protected dashboard routes
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── features/     # Feature-specific components
│   │   ├── forms/        # Form components
│   │   └── layout/       # Layout components
│   ├── config/           # Configuration files
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── services/         # API services
│   └── types/            # TypeScript types
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── .env.example          # Environment variable template
├── docker-compose.yml    # Docker services configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project overview
```

---

## Common Issues & Troubleshooting

### Database Connection Refused

**Problem:** Can't connect to PostgreSQL

**Solutions:**
```bash
# Check if Docker is running
docker ps

# Start database container
docker-compose up -d postgres

# View logs
docker-compose logs postgres

# Verify database is ready
docker-compose exec postgres pg_isready -U postgres
```

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solutions:**
```bash
# Option 1: Change port in .env
PORT=3001

# Option 2: Kill process using the port (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### Prisma Migration Errors

**Problem:** Migration fails or schema is out of sync

**Solutions:**
```bash
# Reset database (WARNING: deletes all data)
pnpm db:reset

# Push schema without migration (for development)
pnpm db:push

# Generate Prisma Client
pnpm db:generate
```

### pnpm Install Fails

**Problem:** Dependency installation errors

**Solutions:**
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Docker Container Won't Start

**Problem:** Container fails to start or exits immediately

**Solutions:**
```bash
# View detailed logs
docker-compose logs -f postgres

# Remove containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Environment Variables Not Loading

**Problem:** App can't find environment variables

**Solutions:**
- Verify `.env` file exists in project root
- Restart development server after changing `.env`
- Check for typos in variable names
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

---

## Development Workflow

### Starting a Development Session

```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
pnpm install

# 3. Start Docker services
pnpm docker:up

# 4. Run any new migrations
pnpm db:migrate

# 5. Start dev server
pnpm dev
```

### Before Committing

```bash
# Run linting
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm type-check

# Run tests
pnpm test
```

### Ending a Development Session

```bash
# Stop Docker containers
pnpm docker:down

# Or keep them running for next session
```

---

## VS Code Setup

### Recommended Extensions

The project includes recommended VS Code extensions in `.vscode/extensions.json`:

- **Prettier** - Code formatting
- **ESLint** - JavaScript/TypeScript linting
- **Prisma** - Prisma schema support
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
- **GitLens** - Enhanced Git integration
- **Error Lens** - Inline error messages
- **Docker** - Docker container management

### Install Recommended Extensions

VS Code will prompt you to install recommended extensions. Or manually:

```
Ctrl+Shift+P (or Cmd+Shift+P on Mac)
> Extensions: Show Recommended Extensions
```

### Editor Configuration

The project includes VS Code settings in `.vscode/settings.json`:

- ✅ Format on save enabled
- ✅ Auto-fix ESLint errors on save
- ✅ Auto-organize imports
- ✅ Consistent tab size (2 spaces)
- ✅ Tailwind CSS IntelliSense configuration

---

## Alternative Database Setup

### Option 1: Local PostgreSQL (Without Docker)

If you prefer not to use Docker:

1. **Install PostgreSQL 16:**
   - macOS: `brew install postgresql@16`
   - Ubuntu: `sudo apt-get install postgresql-16`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create database:**
   ```bash
   createdb listly
   ```

3. **Update `.env`:**
   ```bash
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/listly?schema=public"
   ```

### Option 2: Supabase (Cloud)

For a fully managed database with real-time features:

1. **Create Supabase project:** [supabase.com](https://supabase.com)
2. **Get connection string:** Settings → Database → Connection string
3. **Update `.env`:**
   ```bash
   DATABASE_URL="your-supabase-connection-string"
   NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

---

## Next Steps

After setup is complete:

1. ✅ Review [environment-variables.md](./environment-variables.md) for configuration options
2. ✅ Read [tech-stack.md](./tech-stack.md) to understand technology choices
3. ✅ Check [requirements.md](./requirements.md) for project requirements
4. ✅ Explore the codebase structure
5. ✅ Start building features!

---

## Getting Help

- **Documentation:** Check `/docs` folder for detailed guides
- **Issues:** Report bugs on GitHub Issues
- **Questions:** Ask in team chat or GitHub Discussions

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Supabase Documentation](https://supabase.com/docs)
