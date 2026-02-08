# SOP-002: Repository Setup

## Purpose

Establish a consistent, well-organized Git repository with proper conventions, branch protection, and documentation from the start. This ensures smooth collaboration and maintainable version control.

---

## Scope

- **Applies to:** All new projects requiring version control
- **Covers:** Git initialization, branching strategy, commit conventions, essential docs
- **Does not cover:** CI/CD pipelines, project structure (see SOP-003)

---

## Prerequisites

- [ ] SOP-001 (Tech Stack Selection) completed
- [ ] `/docs/tech-stack.md` exists
- [ ] Git installed locally
- [ ] Repository hosting account (GitHub, GitLab, Bitbucket)

---

## Procedure

### 1. Initialize Repository

```bash
# Create and initialize
mkdir {project-name} && cd {project-name}
git init

# Set default branch to main
git branch -M main
```

### 2. Create .gitignore

Based on tech stack from SOP-001, create appropriate `.gitignore`:

**For Node.js/TypeScript projects:**
```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo
.vercel
```

**For Python projects:**
```gitignore
# Virtual environments
venv/
.venv/
env/

# Python cache
__pycache__/
*.py[cod]
*.pyo

# Environment files
.env
.env.local

# IDE
.vscode/
.idea/

# Build
dist/
build/
*.egg-info/

# Testing
.pytest_cache/
.coverage
htmlcov/

# Misc
.DS_Store
```

### 3. Define Branching Strategy

Choose and document a branching model:

**Recommended: GitHub Flow (Simple)**
```
main (production-ready)
  └── feature/xxx (short-lived feature branches)
  └── fix/xxx (bug fixes)
  └── chore/xxx (maintenance tasks)
```

**Alternative: Git Flow (Complex projects)**
```
main (production)
  └── develop (integration)
        └── feature/xxx
        └── release/x.x.x
        └── hotfix/xxx
```

Document in `/docs/git-workflow.md` or in `CONTRIBUTING.md`.

### 4. Set Up Commit Message Convention

Use Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature or fix |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

**Examples:**
```
feat(auth): add Google OAuth login
fix(api): handle null user in profile endpoint
docs(readme): update installation steps
chore(deps): upgrade Next.js to 14.1
```

### 5. Create README.md

````markdown
# {Project Name}

{One-line description of the project}

## Features

- Feature 1
- Feature 2
- Feature 3

## Tech Stack

- **Frontend:** {framework}
- **Backend:** {framework}
- **Database:** {database}

See [Tech Stack Details](docs/tech-stack.md) for full documentation.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL (or Docker)

### Installation

```bash
# Clone the repository
git clone {repo-url}
cd {project-name}

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Environment Variables

See [.env.example](.env.example) for required variables.

## Development

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm test       # Run tests
pnpm lint       # Run linter
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

{License type} - see [LICENSE](LICENSE) for details.
```

### 6. Create CONTRIBUTING.md

```markdown
# Contributing to {Project Name}

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Commit using conventional commits
6. Push and open a Pull Request

## Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `chore/` — Maintenance tasks
- `refactor/` — Code refactoring

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Squash commits before merging

## Code Style

- Run `pnpm lint` before committing
- Follow existing code patterns
- Add tests for new features

## Questions?

Open an issue for questions or discussions.
````

### 7. Create Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description

<!-- What does this PR do? -->

## Type of Change

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📝 Documentation update
- [ ] 🔧 Refactoring
- [ ] 🧪 Test update

## Related Issues

<!-- Link related issues: Fixes #123 -->

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated documentation as needed

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->
```

### 8. Set Up Branch Protection (on remote)

After pushing to GitHub/GitLab, configure:

**Recommended branch protection for `main`:**
- [ ] Require pull request reviews before merging
- [ ] Require status checks to pass (when CI is set up)
- [ ] Require branches to be up to date
- [ ] Restrict who can push directly

### 9. Initial Commit

```bash
git add .
git commit -m "chore: initial project setup"
git remote add origin {repo-url}
git push -u origin main
```

---

## Review Checklist

- [ ] Repository initialized with `main` branch
- [ ] `.gitignore` configured for tech stack
- [ ] Branching strategy documented
- [ ] Commit message convention defined
- [ ] `README.md` created with setup instructions
- [ ] `CONTRIBUTING.md` created
- [ ] PR template created
- [ ] Remote repository created
- [ ] Initial commit pushed
- [ ] Branch protection rules configured

---

## AI Agent Prompt Template

```
Set up the Git repository for this project.

Read `/docs/tech-stack.md` for technology context.

Execute SOP-002 (Repository Setup):
1. Generate appropriate .gitignore for the tech stack
2. Create README.md with project overview and setup instructions
3. Create CONTRIBUTING.md with guidelines
4. Create PR template
5. Document commit conventions

The project is: {brief description}
```

---

## Outputs

- [ ] `.gitignore` — Configured for project tech stack
- [ ] `README.md` — Project overview and setup instructions
- [ ] `CONTRIBUTING.md` — Contribution guidelines
- [ ] `.github/pull_request_template.md` — PR template
- [ ] Repository pushed to remote
- [ ] Branch protection configured

---

## Related SOPs

- **SOP-001:** Tech Stack Selection (informs `.gitignore`)
- **SOP-003:** Project Structure (folder organization)
- **SOP-006:** Code Style Standards (linting rules referenced in CONTRIBUTING)
