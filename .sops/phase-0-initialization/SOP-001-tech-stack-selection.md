# SOP-001: Tech Stack Selection

## Purpose

Provide a structured decision-making process for selecting technologies, frameworks, and tools for a project. This ensures choices are justified, documented, and aligned with project requirements and team capabilities.

---

## Scope

- **Applies to:** All new projects requiring technology decisions
- **Covers:** Languages, frameworks, databases, hosting, third-party services
- **Does not cover:** Detailed implementation (see phase-specific SOPs)

---

## Prerequisites

- [ ] SOP-000 (Requirements Gathering) completed
- [ ] `/docs/requirements.md` exists
- [ ] Team skills inventory known

---

## Procedure

### 1. Review Project Requirements

Read `/docs/requirements.md` and extract technology-relevant factors:

| Factor                    | From Requirements               |
| ------------------------- | ------------------------------- |
| **Performance needs**     | Response time, concurrent users |
| **Scale expectations**    | User growth, data volume        |
| **Security requirements** | Compliance, data sensitivity    |
| **Timeline**              | Development speed priority      |
| **Budget**                | Hosting costs, licensing        |
| **Team expertise**        | Existing skills, learning curve |

### 2. Identify Technology Categories

For most web applications:

| Category               | Options to Consider                           |
| ---------------------- | --------------------------------------------- |
| **Frontend Framework** | React, Vue, Angular, Svelte, Next.js, Nuxt    |
| **Backend Framework**  | Node/Express, Python/FastAPI, Go, Ruby/Rails  |
| **Database**           | PostgreSQL, MySQL, MongoDB, SQLite            |
| **ORM/Query Builder**  | Prisma, SQLAlchemy, TypeORM, Drizzle          |
| **Authentication**     | NextAuth, Auth0, Clerk, Supabase Auth, Custom |
| **Hosting**            | Vercel, Railway, AWS, GCP, DigitalOcean       |
| **File Storage**       | S3, Cloudflare R2, Supabase Storage           |
| **Email Service**      | Resend, SendGrid, AWS SES                     |
| **Monitoring**         | Sentry, LogRocket, Datadog                    |

### 3. Evaluate Options Using Decision Matrix

For each category, score options (1-5) against criteria:

```markdown
## Frontend Framework Evaluation

| Criteria            | Weight | React  | Vue    | Svelte |
| ------------------- | ------ | ------ | ------ | ------ |
| Team experience     | 5      | 5      | 3      | 2      |
| Ecosystem/libraries | 4      | 5      | 4      | 3      |
| Performance         | 3      | 4      | 4      | 5      |
| Learning curve      | 2      | 3      | 4      | 4      |
| Hiring pool         | 3      | 5      | 3      | 2      |
| **Weighted Total**  |        | **76** | **61** | **52** |

**Decision:** React — Best team experience and ecosystem support.
```

### 4. Consider Stack Synergies

Some technologies work better together:

| Stack Pattern       | Components                         | Best For                           |
| ------------------- | ---------------------------------- | ---------------------------------- |
| **T3 Stack**        | Next.js, tRPC, Prisma, TypeScript  | Full-stack TypeScript apps         |
| **MERN**            | MongoDB, Express, React, Node      | JavaScript everywhere              |
| **Django + React**  | Django REST, React, PostgreSQL     | Python backend, React frontend     |
| **Rails + Hotwire** | Ruby on Rails, Hotwire, PostgreSQL | Rapid development, server-rendered |
| **Go + Vue**        | Go/Gin, Vue, PostgreSQL            | High-performance APIs              |

### 5. Validate Against Constraints

Cross-check selections against requirements:

| Constraint      | Check                                                          |
| --------------- | -------------------------------------------------------------- |
| **Budget**      | Are all services within budget? Free tiers sufficient for MVP? |
| **Timeline**    | Does team have enough experience to deliver on time?           |
| **Scalability** | Can the stack handle projected growth?                         |
| **Security**    | Does it meet compliance requirements?                          |
| **Maintenance** | Is long-term support available?                                |

### 6. Document Decisions

Create `/docs/tech-stack.md`:

```markdown
# Tech Stack: {Project Name}

## Overview

| Layer          | Technology         | Version |
| -------------- | ------------------ | ------- |
| Frontend       | Next.js            | 14.x    |
| Backend        | Next.js API Routes | 14.x    |
| Database       | PostgreSQL         | 16      |
| ORM            | Prisma             | 5.x     |
| Authentication | NextAuth.js        | 5.x     |
| Hosting        | Vercel             | -       |
| Styling        | Tailwind CSS       | 3.x     |
| Language       | TypeScript         | 5.x     |

## Decision Rationale

### Frontend: Next.js

**Chosen because:**

- Team has React experience
- Built-in SSR/SSG for performance
- API routes simplify backend
- Vercel deployment is seamless

**Alternatives considered:**

- Vue/Nuxt: Less team experience
- SvelteKit: Smaller ecosystem

### Database: PostgreSQL

**Chosen because:**

- Relational data model fits requirements
- Excellent Prisma support
- Free tier on Railway/Supabase
- Battle-tested reliability

**Alternatives considered:**

- MongoDB: No clear need for document store
- SQLite: Not suitable for production scale

### [Continue for each major decision...]

## Dependencies & Integrations

| Service  | Purpose             | Tier/Cost                |
| -------- | ------------------- | ------------------------ |
| Vercel   | Hosting             | Free tier → Pro at scale |
| Supabase | Database hosting    | Free tier                |
| Resend   | Transactional email | Free tier (100/day)      |
| Sentry   | Error tracking      | Free tier                |

## Risks & Mitigations

| Risk                      | Mitigation                            |
| ------------------------- | ------------------------------------- |
| Vercel cold starts        | Use edge functions for critical paths |
| Supabase free tier limits | Monitor usage, plan upgrade path      |

## Future Considerations

- Consider Redis for caching if performance issues arise
- Evaluate Cloudflare for CDN if global audience grows
```

### 7. Create Initial Package Configuration

Based on decisions, outline initial dependencies:

```json
// Example: package.json structure
{
  "dependencies": {
    "next": "^14.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^5.0.0"
    // ...
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prisma": "^5.0.0"
    // ...
  }
}
```

---

## Review Checklist

- [ ] All major technology categories addressed
- [ ] Decision matrix used for significant choices
- [ ] Rationale documented for each decision
- [ ] Stack synergies considered
- [ ] Constraints validated
- [ ] Costs estimated and within budget
- [ ] `/docs/tech-stack.md` created
- [ ] Team reviewed and approved selections

---

## AI Agent Prompt Template

```
Based on the requirements in `/docs/requirements.md`, help me select a tech stack.

Execute SOP-001 (Tech Stack Selection):
1. Review the requirements and extract tech-relevant factors
2. Recommend technologies for each category
3. Create decision matrices for major choices
4. Document rationale for each selection
5. Generate `/docs/tech-stack.md`

Consider: {any specific constraints or preferences}
```

---

## Outputs

- [ ] `/docs/tech-stack.md` — Complete technology decisions with rationale
- [ ] Initial dependency list outlined
- [ ] Cost estimates documented

---

## Related SOPs

- **SOP-000:** Requirements Gathering (input for decisions)
- **SOP-002:** Repository Setup (uses tech stack for `.gitignore`, tooling)
- **SOP-003:** Project Structure (folder conventions based on framework)
- **SOP-006:** Code Style Standards (language-specific tooling)

---

## Common Stack Recommendations by Project Type

| Project Type     | Recommended Stack                       | Notes                   |
| ---------------- | --------------------------------------- | ----------------------- |
| **MVP/Startup**  | Next.js, Prisma, PostgreSQL, Vercel     | Fast to market, good DX |
| **Enterprise**   | Java/Spring or .NET, PostgreSQL, AWS    | Scalability, support    |
| **Real-time**    | Node.js, Socket.io, Redis, PostgreSQL   | WebSocket support       |
| **Data-heavy**   | Python/FastAPI, PostgreSQL, Celery      | Async processing        |
| **Mobile + Web** | React Native + Next.js, shared API      | Code sharing            |
| **AI/ML**        | Python/FastAPI, PostgreSQL, HuggingFace | ML ecosystem            |
