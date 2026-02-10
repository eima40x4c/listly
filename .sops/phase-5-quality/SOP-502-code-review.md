# SOP-502: Code Review

## Purpose

Establish code review standards and checklists to ensure consistent quality, catch bugs early, share knowledge, and maintain code standards. Good code reviews balance thoroughness with speed.

---

## Scope

- **Applies to:** All code changes before merging to main branches
- **Covers:** Review process, checklists, PR standards, feedback guidelines
- **Does not cover:** Automated checks (linting, CI), pair programming

---

## Prerequisites

- [ ] SOP-002 (Repository Setup) — branching strategy defined
- [ ] SOP-006 (Code Style) — standards established
- [ ] Pull request workflow configured

---

## Procedure

### 1. Pull Request Standards

#### PR Title Format

Follow conventional commits:

```
type(scope): brief description

Examples:
feat(auth): add password reset functionality
fix(cart): correct quantity calculation
refactor(api): simplify error handling
docs(readme): update installation steps
```

#### PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- What does this PR do? Why is it needed? -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to change)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)

## Related Issues

<!-- Link to related issues: Fixes #123, Relates to #456 -->

## Changes Made

<!-- List the main changes -->

-
-
-

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manually tested locally
- [ ] Tested in staging environment

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No console.logs or debug code
- [ ] No new lint warnings

## Notes for Reviewers

<!-- Any specific areas to focus on? Context to help reviewers? -->
```

### 2. Code Review Checklist

#### Functionality

- [ ] Code does what the PR description says
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors
- [ ] Business requirements are met

#### Code Quality

- [ ] Code is readable and self-documenting
- [ ] Functions/methods have single responsibility
- [ ] No code duplication (DRY)
- [ ] Appropriate abstraction level
- [ ] Variable/function names are clear
- [ ] Comments explain "why" not "what"

#### Security

- [ ] No hardcoded secrets or credentials
- [ ] User input is validated and sanitized
- [ ] SQL/NoSQL injection prevented
- [ ] XSS vulnerabilities checked
- [ ] Authorization checks in place
- [ ] Sensitive data properly handled

#### Performance

- [ ] No obvious N+1 queries
- [ ] Appropriate database indexes considered
- [ ] No memory leaks
- [ ] Async operations handled correctly
- [ ] Large operations paginated

#### Testing

- [ ] Adequate test coverage
- [ ] Tests are meaningful (not just coverage)
- [ ] Edge cases tested
- [ ] Tests are maintainable
- [ ] No flaky tests introduced

#### Architecture

- [ ] Follows established patterns
- [ ] No unnecessary dependencies added
- [ ] Backward compatibility considered
- [ ] API changes documented

### 3. Reviewer Guidelines

#### What to Look For

```markdown
## Priority Order for Review

1. **Correctness**: Does it work? Are there bugs?
2. **Security**: Are there vulnerabilities?
3. **Design**: Does it fit the architecture?
4. **Readability**: Is it understandable?
5. **Style**: Does it follow conventions?

## Time Investment

- Small PR (<100 lines): 15-30 minutes
- Medium PR (100-300 lines): 30-60 minutes
- Large PR (300+ lines): Consider splitting or pair reviewing
```

#### Giving Feedback

**Use comment prefixes:**

```markdown
**nit:** Optional suggestion, minor style preference
**suggestion:** Recommended change, not blocking
**question:** Seeking clarification, not blocking
**issue:** Must be addressed before merge
**blocker:** Critical issue, cannot merge
```

**Examples of good feedback:**

````markdown
# Good: Specific and actionable

**issue:** This could throw if `user` is null. Consider adding a null check:

```js
if (!user) throw new NotFoundError('User not found');
```
````

# Good: Explains the why

**suggestion:** Using `Promise.all` here would run these queries in parallel,
reducing response time from ~200ms to ~100ms.

# Good: Offers alternatives

**question:** Is there a reason we're not using the existing `formatDate`
utility? It handles timezone conversion which might be needed here.

# Bad: Vague

"This could be better"

# Bad: Opinion without reasoning

"I would have done this differently"

# Bad: Harsh

"Why would you ever do it this way?"

````

### 4. Author Guidelines

#### Before Requesting Review

```markdown
## Self-Review Checklist

- [ ] I've reviewed my own changes
- [ ] Code compiles without errors
- [ ] All tests pass locally
- [ ] No unrelated changes included
- [ ] PR is appropriately sized (<300 lines ideal)
- [ ] Description explains what and why
- [ ] Linked related issues
- [ ] Added reviewers
````

#### Responding to Feedback

- Respond to every comment
- If you disagree, explain your reasoning
- If you agree, make the change AND respond
- Ask for clarification if needed
- Don't take feedback personally

**Response examples:**

```markdown
# Acknowledging and fixing

"Good catch! Fixed in abc123."

# Explaining your reasoning

"I considered that, but chose this approach because [reason].
Happy to discuss if you still have concerns."

# Asking for clarification

"I'm not sure I understand. Could you elaborate on
what you mean by 'simplify this'?"

# Deferring with a plan

"Agreed this needs refactoring. I'll create a follow-up issue
to address this properly: #456"
```

### 5. Review Process Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     Code Review Process                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                 │
│  │   Author    │                                                 │
│  │ creates PR  │                                                 │
│  └──────┬──────┘                                                 │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐     ┌─────────────┐                            │
│  │ Self-review │────▶│  Add tests  │                            │
│  │  & cleanup  │     │ if missing  │                            │
│  └──────┬──────┘     └──────┬──────┘                            │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌─────────────────────────────────┐                            │
│  │   Request review (1-2 people)  │                            │
│  └──────────────┬──────────────────┘                            │
│                 │                                                │
│                 ▼                                                │
│  ┌─────────────────────────────────┐                            │
│  │      CI checks pass?           │──No──▶ Fix issues          │
│  └──────────────┬──────────────────┘                            │
│                 │ Yes                                            │
│                 ▼                                                │
│  ┌─────────────────────────────────┐                            │
│  │    Reviewers provide feedback  │                            │
│  └──────────────┬──────────────────┘                            │
│                 │                                                │
│                 ▼                                                │
│  ┌─────────────────────────────────┐                            │
│  │   Changes requested?           │──Yes──▶ Author updates     │
│  └──────────────┬──────────────────┘          │                 │
│                 │ No                          │                 │
│                 ▼                             ▼                 │
│  ┌─────────────────────────────────┐   ┌───────────┐           │
│  │      Approved by 1+ reviewer   │◀──│ Re-review │           │
│  └──────────────┬──────────────────┘   └───────────┘           │
│                 │                                                │
│                 ▼                                                │
│  ┌─────────────────────────────────┐                            │
│  │      Merge (squash/rebase)     │                            │
│  └─────────────────────────────────┘                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6. GitHub PR Settings

Configure repository settings:

```yaml
# .github/settings.yml (if using probot settings)

branches:
  - name: main
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
        require_code_owner_reviews: false
      required_status_checks:
        strict: true
        contexts:
          - build
          - test
          - lint
      enforce_admins: false
      required_linear_history: true
```

### 7. CODEOWNERS File

Create `.github/CODEOWNERS`:

```
# Default owners for everything
* @team-leads

# Specific paths
/src/lib/auth/ @security-team
/prisma/ @database-team
/docs/ @documentation-team
/.github/ @devops-team

# By file type
*.sql @database-team
Dockerfile @devops-team
```

### 8. Automated Checks Before Review

```yaml
# .github/workflows/pr-checks.yml

name: PR Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test:run

      - name: Build
        run: pnpm build
```

### 9. Review Turnaround Guidelines

| PR Size                | Expected Review Time |
| ---------------------- | -------------------- |
| Tiny (<50 lines)       | Same day             |
| Small (<100 lines)     | Within 1 day         |
| Medium (100-300 lines) | Within 2 days        |
| Large (300+ lines)     | Discuss splitting    |

**Tips for fast reviews:**

- Keep PRs small and focused
- Write clear descriptions
- Pre-address obvious questions
- Be available for questions
- Review others promptly

---

## Review Checklist

- [ ] PR template created
- [ ] Review checklist documented
- [ ] Feedback guidelines established
- [ ] CODEOWNERS configured
- [ ] Branch protection enabled
- [ ] CI checks configured
- [ ] Team trained on process

---

## AI Agent Prompt Template

```
Set up code review infrastructure for this project.

Read:
- `.github/` for existing configuration
- Team size and structure

Execute SOP-502 (Code Review):
1. Create PR template
2. Configure branch protection
3. Set up CODEOWNERS
4. Create PR checks workflow
5. Document review guidelines in CONTRIBUTING.md
```

---

## Outputs

- [ ] `.github/PULL_REQUEST_TEMPLATE.md` — PR template
- [ ] `.github/CODEOWNERS` — Code ownership
- [ ] `.github/workflows/pr-checks.yml` — Automated checks
- [ ] `CONTRIBUTING.md` — Updated with review process
- [ ] Repository settings configured

---

## Related SOPs

- **SOP-002:** Repository Setup (Git workflow)
- **SOP-006:** Code Style Standards (what to check for)
- **SOP-601:** CI/CD Pipelines (automated checks)

---

## Quick Reference Card

```markdown
## For Authors

✅ Keep PRs small (<300 lines)
✅ Write clear descriptions
✅ Self-review before requesting
✅ Respond to all comments
✅ Update and re-request review

## For Reviewers

✅ Prioritize correctness & security
✅ Be specific and actionable
✅ Explain the "why"
✅ Use comment prefixes
✅ Review within SLA

## Comment Prefixes

nit: Minor style suggestion
suggestion: Recommended, not blocking
question: Need clarification
issue: Must fix
blocker: Cannot merge
```
