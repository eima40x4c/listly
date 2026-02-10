# Standard Operating Procedures (SOPs)

> **A systematic framework for consistent, efficient software development**

This repository contains standardized procedures for software project development. Each SOP provides step-by-step guidance to ensure quality, consistency, and efficiency across all projects.

---

## Purpose

- **Consistency** – Ensure all projects follow the same high-quality standards
- **Efficiency** – Reduce decision fatigue and repetitive planning
- **Onboarding** – Help new team members get up to speed quickly
- **AI-Assisted Development** – Provide structured prompts for agentic AI workflows

---

## Directory Structure

When copied to a new project, the structure is:

```
{project-root}/
├── .prompts/                         # AI session management
│   ├── AI-GUIDE.md                   # Guide for using SOPs with AI agents
│   └── AI-SESSION.md                 # Session tracker (AI-managed)
├── .sops/                            # Standard Operating Procedures
│   ├── README.md                     # This file (SOP index)
│   ├── templates/                    # Reusable templates and checklists
│   │   ├── project-checklist.md      # Complete project checklist
│   │   ├── tech-stack-decision-matrix.md
│   │   └── api-design-template.yaml  # OpenAPI specification template
│   ├── phase-0-initialization/       # Project setup and planning
│   ├── phase-1-database/             # Database design and setup
│   ├── phase-2-backend/              # API and backend development
│   ├── phase-3-frontend/             # Frontend development
│   ├── phase-4-ai-integration/       # AI/LLM integration (when applicable)
│   ├── phase-5-quality/              # Testing and quality assurance
│   └── phase-6-deployment/           # Deployment and operations
└── {project files}
```

---

## SOP Index

### Phase 0: Project Initialization

| SOP                                                                 | Title                  | Description                                               |
| ------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| [SOP-000](phase-0-initialization/SOP-000-requirements-gathering.md) | Requirements Gathering | Stakeholder interviews, user stories, acceptance criteria |
| [SOP-001](phase-0-initialization/SOP-001-tech-stack-selection.md)   | Tech Stack Selection   | Decision matrix for languages, frameworks, infrastructure |
| [SOP-002](phase-0-initialization/SOP-002-repository-setup.md)       | Repository Setup       | Git conventions, branch strategies, commit standards      |
| [SOP-003](phase-0-initialization/SOP-003-project-structure.md)      | Project Structure      | Folder conventions, naming standards                      |
| [SOP-004](phase-0-initialization/SOP-004-environment-setup.md)      | Environment Setup      | Dev containers, `.env` templates, secrets management      |
| [SOP-005](phase-0-initialization/SOP-005-design-patterns.md)        | Design Patterns        | Architectural & code-level design pattern selection       |
| [SOP-006](phase-0-initialization/SOP-006-code-style-standards.md)   | Code Style Standards   | Language-specific formatting, linting, naming conventions |

### Phase 1: Database & Data Layer

| SOP                                                       | Title              | Description                                            |
| --------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| [SOP-100](phase-1-database/SOP-100-database-selection.md) | Database Selection | SQL vs NoSQL decision tree, scaling considerations     |
| [SOP-101](phase-1-database/SOP-101-schema-design.md)      | Schema Design      | ERD conventions, normalization rules, naming standards |
| [SOP-102](phase-1-database/SOP-102-seed-data.md)          | Seed Data          | Test data generation, fixtures, anonymization          |

### Phase 2: API & Backend Development

| SOP                                                  | Title          | Description                                          |
| ---------------------------------------------------- | -------------- | ---------------------------------------------------- |
| [SOP-200](phase-2-backend/SOP-200-api-design.md)     | API Design     | REST/GraphQL conventions, OpenAPI specs, versioning  |
| [SOP-201](phase-2-backend/SOP-201-authentication.md) | Authentication | OAuth2, JWT, session management patterns             |
| [SOP-202](phase-2-backend/SOP-202-authorization.md)  | Authorization  | RBAC/ABAC implementation, permission matrices        |
| [SOP-203](phase-2-backend/SOP-203-error-handling.md) | Error Handling | Standard error codes, logging formats, user messages |
| [SOP-204](phase-2-backend/SOP-204-validation.md)     | Validation     | Input sanitization, schema validation                |

### Phase 3: Frontend Development

| SOP                                                           | Title                            | Description                                         |
| ------------------------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| [SOP-300](phase-3-frontend/SOP-300-component-architecture.md) | Component Architecture           | Atomic design, state management patterns            |
| [SOP-301](phase-3-frontend/SOP-301-styling-standards.md)      | Styling Standards                | CSS methodology, design tokens, accessibility       |
| [SOP-302](phase-3-frontend/SOP-302-api-integration.md)        | API Integration                  | Data fetching patterns, caching, optimistic updates |
| [SOP-303](phase-3-frontend/SOP-303-form-handling.md)          | Form Handling                    | Validation UX, error states, submission flows       |
| [SOP-304](phase-3-frontend/SOP-304-progressive-web-app.md)    | Progressive Web App _(Optional)_ | PWA setup, offline support, mobile UI, native APIs  |

### Phase 4: AI Integration

| SOP                                                          | Title           | Description                                        |
| ------------------------------------------------------------ | --------------- | -------------------------------------------------- |
| [SOP-400](phase-4-ai-integration/SOP-400-ai-feasibility.md)  | AI Feasibility  | When to use AI, cost-benefit analysis              |
| [SOP-401](phase-4-ai-integration/SOP-401-llm-integration.md) | LLM Integration | API patterns, prompt templates, response parsing   |
| [SOP-402](phase-4-ai-integration/SOP-402-ai-testing.md)      | AI Testing      | Evaluation metrics, regression testing for prompts |
| [SOP-403](phase-4-ai-integration/SOP-403-cost-monitoring.md) | Cost Monitoring | Token usage tracking, rate limiting, budgets       |

### Phase 5: Quality Assurance

| SOP                                                       | Title               | Description                                         |
| --------------------------------------------------------- | ------------------- | --------------------------------------------------- |
| [SOP-500](phase-5-quality/SOP-500-unit-testing.md)        | Unit Testing        | Vitest setup, mocking strategies, coverage targets  |
| [SOP-501](phase-5-quality/SOP-501-integration-testing.md) | Integration Testing | Test database, factories, API testing               |
| [SOP-502](phase-5-quality/SOP-502-code-review.md)         | Code Review         | Review checklist, PR templates, feedback guidelines |
| [SOP-503](phase-5-quality/SOP-503-documentation.md)       | Documentation       | README, TSDoc, OpenAPI, architecture docs           |

### Phase 6: Deployment & Operations

| SOP                                                         | Title                     | Description                                           |
| ----------------------------------------------------------- | ------------------------- | ----------------------------------------------------- |
| [SOP-600](phase-6-deployment/SOP-600-environment-config.md) | Environment Configuration | Secrets management, env validation, multi-environment |
| [SOP-601](phase-6-deployment/SOP-601-cicd-pipelines.md)     | CI/CD Pipelines           | GitHub Actions, automated testing, deployment         |
| [SOP-602](phase-6-deployment/SOP-602-monitoring.md)         | Monitoring & Alerting     | Sentry, logging, health checks, metrics               |
| [SOP-603](phase-6-deployment/SOP-603-maintenance.md)        | Maintenance & Incidents   | Updates, backups, incident response, runbooks         |

---

## Quick Start

### Starting a New Project

1. **Copy the framework to your new project:**

   ```bash
   # Create project directory
   mkdir my-project && cd my-project

   # Copy both folders as-is
   cp -r /path/to/sops-repo/.prompts .
   cp -r /path/to/sops-repo/.sops .
   ```

2. **Start an AI session** with this simple prompt:

   ```markdown
   I'm starting a new project: {NAME}.
   {One or two sentences describing what you're building}

   Read `.prompts/AI-GUIDE.md` to understand the workflow.
   Then initialize `.prompts/AI-SESSION.md` and begin with SOP-000.
   ```

3. **The AI will automatically:**
   - Fill in `.prompts/AI-SESSION.md` with project details
   - Guide you through each SOP
   - Track progress and update the session file

### Using with AI Agents

**📖 See [.prompts/AI-GUIDE.md](../.prompts/AI-GUIDE.md) for comprehensive instructions.**

The AI agent manages the entire workflow:

- **Human provides:** Project name + description
- **AI handles:** Session tracking, SOP execution, file creation, progress updates
- **Human reviews:** Outputs, provides feedback, and approves completion

---

## SOP Document Structure

Each SOP follows a consistent format:

```markdown
# SOP-XXX: Title

## Purpose

Why this SOP exists and what problem it solves.

## Scope

What this SOP covers and doesn't cover.

## Prerequisites

- [ ] Required SOPs completed
- [ ] Tools/access needed

## Procedure

Step-by-step instructions.

## Review Checklist

- [ ] Verification items

## AI Agent Prompt Template

Structured prompt for AI-assisted execution.

## Outputs

Expected deliverables from this SOP.

## Related SOPs

Links to related procedures.
```

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROJECT LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│     Phase 0          Phase 1         Phase 2         Phase 3            │
│     ────────         ────────        ────────        ────────           │
│     [Init]    ──►    [Database] ──►  [Backend] ──►   [Frontend]         │
│     SOP-000          SOP-100         SOP-200         SOP-300            │
│     to               to              to              to                 │
│     SOP-006          SOP-102         SOP-204         SOP-304*           │
│                                                                         │
│                         │                                               │
│                         ▼                                               │
│                    Phase 4 (Optional)                                   │
│                    ──────────────────                                   │
│                    [AI Integration]                                     │
│                    SOP-400 to SOP-403                                   │
│                         │                                               │
│                         ▼                                               │
│     Phase 5          Phase 6                                            │
│     ────────         ────────                                           │
│     [Quality]  ──►   [Deploy]   ──►   🚀 PRODUCTION                     │
│     SOP-500          SOP-600                                            │
│     to               to                                                 │
│     SOP-503          SOP-603                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Templates

| Template                                                       | Purpose                          | Copy To                  |
| -------------------------------------------------------------- | -------------------------------- | ------------------------ |
| [project-checklist.md](templates/project-checklist.md)         | Complete project setup checklist | Project root             |
| [api-design-template.yaml](templates/api-design-template.yaml) | OpenAPI 3.0 specification        | `/docs/api/openapi.yaml` |
| tech-stack-decision-matrix.md                                  | Framework/tool comparison        | Use during SOP-001       |

> **Note:** AI session files (`AI-GUIDE.md` and `AI-SESSION.md`) are located in `.prompts/` and should be copied as-is to new projects.

---

## Contributing to SOPs

### Adding a New SOP

1. Identify which phase the SOP belongs to
2. Use the next available number in that phase
3. Follow the standard SOP document structure
4. Update this README's SOP Index
5. Add cross-references to related SOPs

### Updating Existing SOPs

1. Document the reason for the change
2. Update the version/date in the SOP
3. Review and update any SOPs that reference the changed SOP
4. Update templates if affected

---

## Version History

| Version | Date       | Changes                                  |
| ------- | ---------- | ---------------------------------------- |
| 1.0.0   | 2026-01-28 | Initial SOP framework with 29 procedures |

---

## Questions?

If an SOP is unclear or you encounter a situation not covered:

1. Document the gap
2. Propose an update or new SOP
3. Discuss with the team before making changes

---

_"Consistency is the foundation of mastery."_
