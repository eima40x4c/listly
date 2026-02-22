# Listly - Smart Shopping Companion


> [!WARNING]
> **DEPRECATED: Initial Prototype / Exploration**
>
> This repository contains the initial prototype and exploration for the Listly project. Active development has been moved to a new repository called [listly](https://github.com/eima40x4c/listly)--This current repository no longer being maintained.

Mobile-first Progressive Web App for smart shopping list management with real-time collaboration, AI suggestions, and pantry tracking.

## ✨ Features

- **Smart Shopping Lists** — Multiple lists with auto-categorization by store aisle for efficient shopping
- **Real-Time Collaboration** — Share lists with family members and see updates instantly
- **Budget & Price Tracking** — Set budgets, record prices, and track spending trends
- **AI-Powered Suggestions** — Get smart item suggestions based on your purchase patterns
- **Pantry Inventory** — Track what you have, including expiration dates to reduce food waste
- **Meal Planning** — Plan meals for the week and generate shopping lists automatically
- **Offline-First** — Works seamlessly without internet with automatic background sync
- **Location Reminders** — Get notified when you're near your favorite stores

## 🛠 Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL 16
- **Real-time:** Supabase Realtime
- **Authentication:** NextAuth.js v5
- **State Management:** Zustand
- **PWA:** next-pwa
- **Hosting:** Vercel
- **Database Hosting:** Supabase

See [Tech Stack Details](docs/tech-stack.md) for full documentation and decision rationale.

## 📋 Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL 16 (or use Supabase)
- Git

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/listly.git
cd listly

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed

# Start development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file in the root directory. See [.env.example](.env.example) for required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Secret for NextAuth.js
- `NEXTAUTH_URL` — Your app URL
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- OAuth provider keys (Google, Apple, etc.)

## 💻 Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed the database
pnpm db:studio    # Open Prisma Studio
```

## 📖 Documentation

- [Requirements](docs/requirements.md) — Detailed project requirements and user stories
- [Tech Stack](docs/tech-stack.md) — Technology decisions and evaluation matrices
- [Architecture](docs/architecture/) — System design and patterns (coming soon)
- [API Documentation](docs/api/) — API endpoints and schemas (coming soon)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following our commit conventions
4. Push and open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug in component
docs(scope): update documentation
chore(deps): upgrade dependencies
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for PWA development.

---

**Status:** 🚧 In Development | **Version:** 0.1.0
