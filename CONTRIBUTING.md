# Contributing to Listly

Thank you for your interest in contributing to Listly! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/listly.git
   cd listly
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes** and commit them (see commit guidelines below)
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** from your fork to our `main` branch

## 🌿 Branch Naming Convention

Use descriptive branch names with the following prefixes:

- `feature/` — New features (e.g., `feature/add-voice-input`)
- `fix/` — Bug fixes (e.g., `fix/shopping-list-sync`)
- `docs/` — Documentation updates (e.g., `docs/update-readme`)
- `chore/` — Maintenance tasks (e.g., `chore/upgrade-deps`)
- `refactor/` — Code refactoring (e.g., `refactor/simplify-auth`)
- `test/` — Test additions or updates (e.g., `test/add-list-tests`)

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear and structured commit history.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                            | Example                                   |
| ---------- | -------------------------------------- | ----------------------------------------- |
| `feat`     | New feature                            | `feat(lists): add voice input for items`  |
| `fix`      | Bug fix                                | `fix(auth): resolve OAuth redirect issue` |
| `docs`     | Documentation only                     | `docs(api): add endpoint examples`        |
| `style`    | Code formatting, no logic change       | `style(ui): fix button spacing`           |
| `refactor` | Code change without new feature or fix | `refactor(db): simplify query logic`      |
| `test`     | Adding or updating tests               | `test(lists): add unit tests for sorting` |
| `chore`    | Maintenance tasks                      | `chore(deps): upgrade Next.js to 14.1`    |
| `perf`     | Performance improvements               | `perf(api): optimize database queries`    |

### Examples

```bash
feat(pantry): add barcode scanning functionality
fix(sync): handle offline queue edge cases
docs(readme): update installation instructions
chore(deps): upgrade Prisma to 5.8.0
refactor(lists): extract list item component
test(auth): add OAuth flow tests
```

### Scope

The scope should indicate which part of the codebase is affected:

- `lists` — Shopping list features
- `pantry` — Pantry inventory
- `auth` — Authentication
- `sync` — Real-time sync
- `ui` — User interface components
- `api` — API routes
- `db` — Database/Prisma
- `pwa` — PWA features

## 🔍 Pull Request Process

1. **Ensure all tests pass** locally:

   ```bash
   pnpm test
   pnpm lint
   ```

2. **Update documentation** if you're changing functionality

3. **Fill out the PR template** completely

4. **Request review** from maintainers

5. **Address review feedback** promptly

6. **Squash commits** if requested before merging

### PR Checklist

Before submitting your PR, make sure:

- [ ] Code follows the project's style guidelines
- [ ] Self-review performed
- [ ] Tests added/updated for new features or fixes
- [ ] All tests pass locally
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (or clearly documented if unavoidable)
- [ ] Commit messages follow Conventional Commits format

## 🎨 Code Style

### General Guidelines

- Write clean, readable, and maintainable code
- Follow existing code patterns and conventions
- Keep functions small and focused (single responsibility)
- Add comments for complex logic, but prefer self-documenting code
- Use TypeScript types properly — avoid `any`

### Formatting

We use automated tools for consistent formatting:

```bash
pnpm lint        # Check for linting issues
pnpm format      # Auto-format with Prettier
```

**Before committing**, run both commands to ensure your code meets our standards.

### TypeScript

- Use explicit types where type inference isn't clear
- Prefer interfaces for object shapes
- Use enums for fixed sets of values
- Leverage utility types (`Partial`, `Pick`, `Omit`, etc.)

### React/Next.js

- Use functional components with hooks
- Prefer server components when possible (Next.js 14)
- Keep components small and composable
- Use `"use client"` directive only when necessary
- Follow Next.js file-based routing conventions

### Database

- Write clear, efficient Prisma queries
- Always handle errors in database operations
- Use transactions for related operations
- Follow the schema naming conventions

## 🧪 Testing

We aim for good test coverage. When contributing:

- Add unit tests for new utilities/functions
- Add integration tests for API routes
- Add component tests for UI components
- Ensure existing tests still pass

```bash
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

## 📚 Documentation

Good documentation helps everyone. Please update docs when:

- Adding new features
- Changing existing behavior
- Fixing bugs that were unclear
- Adding new environment variables
- Changing API endpoints

## 🐛 Bug Reports

Found a bug? Please open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

## 💡 Feature Requests

Have an idea? Open an issue with:

- Clear description of the feature
- Use case and benefits
- Potential implementation approach (optional)

## ❓ Questions?

- Open a [Discussion](https://github.com/yourusername/listly/discussions) for general questions
- Open an [Issue](https://github.com/yourusername/listly/issues) for bug reports or feature requests
- Check existing issues before creating new ones

## 📜 Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to build something great together.

---

Thank you for contributing to Listly! 🙌
