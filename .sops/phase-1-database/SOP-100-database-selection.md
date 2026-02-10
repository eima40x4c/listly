# SOP-100: Database Selection

## Purpose

Select the most appropriate database technology based on project requirements, data characteristics, and team expertise. The right database choice impacts performance, scalability, and development velocity.

---

## Scope

- **Applies to:** All projects requiring persistent data storage
- **Covers:** Database type selection, hosting decision, ORM/driver selection
- **Does not cover:** Schema design (see SOP-101), query optimization

---

## Prerequisites

- [ ] SOP-000 (Requirements Gathering) completed
- [ ] SOP-001 (Tech Stack Selection) completed
- [ ] Data requirements identified

---

## Procedure

### 1. Understand Data Requirements

Answer these questions:

| Question                   | Impact on Choice                                   |
| -------------------------- | -------------------------------------------------- |
| What's the data structure? | Structured → SQL, Flexible → NoSQL                 |
| How much data expected?    | Volume affects scaling strategy                    |
| Read vs write heavy?       | Read → optimize indexes, Write → consider sharding |
| Need ACID transactions?    | Yes → SQL, Maybe → Depends                         |
| What relationships exist?  | Complex → SQL, Simple → Either                     |
| Need real-time features?   | Yes → Consider Firebase/Supabase                   |

### 2. Database Type Comparison

#### Relational (SQL) Databases

**Best for:** Structured data, complex relationships, transactions

| Database       | Best For                           | Hosting Options                  |
| -------------- | ---------------------------------- | -------------------------------- |
| **PostgreSQL** | Most applications, complex queries | Supabase, Railway, Neon, AWS RDS |
| **MySQL**      | Traditional web apps, WordPress    | PlanetScale, Railway, AWS RDS    |
| **SQLite**     | Local/embedded, small apps         | File-based (local)               |

**Choose SQL when:**

- ✅ Data has clear structure and relationships
- ✅ Need JOINs across multiple tables
- ✅ ACID compliance is required
- ✅ Complex queries and aggregations needed

#### Document (NoSQL) Databases

**Best for:** Flexible schemas, hierarchical data

| Database               | Best For                            | Hosting Options           |
| ---------------------- | ----------------------------------- | ------------------------- |
| **MongoDB**            | Flexible documents, rapid iteration | MongoDB Atlas (free tier) |
| **Firebase Firestore** | Real-time apps, mobile              | Firebase (free tier)      |

**Choose Document DB when:**

- ✅ Schema changes frequently
- ✅ Data is hierarchical/nested
- ✅ Need horizontal scaling
- ✅ Each document is self-contained

#### Key-Value Stores

**Best for:** Caching, sessions, simple lookups

| Database     | Best For                              |
| ------------ | ------------------------------------- |
| **Redis**    | Caching, sessions, real-time features |
| **DynamoDB** | Serverless, high-scale key-value      |

### 3. Decision Matrix

Rate each option (1-5) based on project needs:

| Criteria                 | Weight | PostgreSQL | MongoDB | SQLite |
| ------------------------ | ------ | ---------- | ------- | ------ |
| Data structure fit       | 25%    | ?          | ?       | ?      |
| Query complexity support | 20%    | ?          | ?       | ?      |
| Scaling requirements     | 15%    | ?          | ?       | ?      |
| Team expertise           | 15%    | ?          | ?       | ?      |
| Hosting cost             | 10%    | ?          | ?       | ?      |
| Ecosystem (ORM/tools)    | 10%    | ?          | ?       | ?      |
| Time to implement        | 5%     | ?          | ?       | ?      |
| **Weighted Score**       | 100%   | ?          | ?       | ?      |

### 4. Common Recommendations

| Project Type             | Recommended DB          | Hosting        | ORM/Driver      |
| ------------------------ | ----------------------- | -------------- | --------------- |
| **SaaS / Web App**       | PostgreSQL              | Supabase, Neon | Prisma          |
| **MVP / Prototype**      | SQLite → PostgreSQL     | Local → Cloud  | Prisma          |
| **Mobile App**           | Firebase Firestore      | Firebase       | SDK             |
| **Content-heavy Site**   | PostgreSQL              | Supabase       | Prisma          |
| **Real-time App**        | Supabase (Postgres)     | Supabase       | Supabase Client |
| **High-write Analytics** | ClickHouse, TimescaleDB | Managed        | Native          |
| **E-commerce**           | PostgreSQL              | Railway, RDS   | Prisma          |

### 5. ORM/Query Builder Selection

| Stack                  | Recommended | Alternative             |
| ---------------------- | ----------- | ----------------------- |
| **Node.js/TypeScript** | Prisma      | Drizzle, TypeORM        |
| **Python**             | SQLAlchemy  | Prisma (Beta), Tortoise |
| **Go**                 | GORM        | sqlx, ent               |
| **Rust**               | Diesel      | SeaORM, sqlx            |

**Prisma Benefits:**

- Type-safe queries
- Auto-generated client
- Easy migrations
- Great DX with IntelliSense

### 6. Hosting Decision

#### Managed vs Self-hosted

| Managed (Recommended) | Self-hosted           |
| --------------------- | --------------------- |
| Automatic backups     | Full control          |
| Scaling handled       | Lower cost at scale   |
| Security updates      | Complex setup         |
| Less DevOps work      | Team expertise needed |

#### Free Tier Options

| Provider          | Free Tier         | Notes                            |
| ----------------- | ----------------- | -------------------------------- |
| **Supabase**      | 500MB, 2 projects | Full PostgreSQL + Auth + Storage |
| **Neon**          | 0.5GB             | Serverless PostgreSQL            |
| **Railway**       | $5/month credit   | PostgreSQL, MySQL, Redis         |
| **PlanetScale**   | 5GB, 1B reads     | Serverless MySQL                 |
| **MongoDB Atlas** | 512MB             | MongoDB                          |
| **Firebase**      | 1GB Firestore     | Real-time DB + Auth              |

### 7. Document Decision

Create `/docs/database/database-decision.md`:

```markdown
# Database Decision

## Selected: PostgreSQL via Supabase

### Requirements Analysis

| Requirement     | Rating | Notes                           |
| --------------- | ------ | ------------------------------- |
| Structured data | High   | User accounts, orders, products |
| Relationships   | High   | Users → Orders → Products       |
| Transactions    | Medium | Checkout process                |
| Scaling         | Low    | Starting small, <10K users      |

### Why PostgreSQL

1. **Data is highly relational** - Users have orders, orders have items
2. **Need complex queries** - Aggregations, filtering, sorting
3. **ACID transactions** - Required for payment processing
4. **Team familiarity** - Team has SQL experience

### Why Supabase Hosting

1. Free tier sufficient for MVP
2. Built-in Auth and Storage
3. Real-time subscriptions available
4. Easy migration path to dedicated PostgreSQL

### Why Prisma ORM

1. Type-safe queries match TypeScript stack
2. Excellent VS Code integration
3. Migration management built-in
4. Large community and docs

### Alternatives Considered

| Option  | Rejected Because              |
| ------- | ----------------------------- |
| MongoDB | Data is clearly relational    |
| SQLite  | Need remote database for team |
| Raw SQL | Prisma provides better DX     |
```

---

## Review Checklist

- [ ] Data requirements analyzed
- [ ] Database type chosen with rationale
- [ ] Hosting solution selected
- [ ] ORM/driver selected
- [ ] Decision documented
- [ ] Cost estimate for scaling understood

---

## AI Agent Prompt Template

```
Help me select a database for this project.

Read `/docs/requirements.md` and `/docs/tech-stack.md` for context.

Execute SOP-100 (Database Selection):
1. Analyze data requirements from requirements.md
2. Compare database options using the decision matrix
3. Recommend database, hosting, and ORM
4. Document decision in `/docs/database/database-decision.md`
```

---

## Outputs

- [ ] `/docs/database/database-decision.md` — Documented decision with rationale

---

## Related SOPs

- **SOP-000:** Requirements Gathering (data requirements)
- **SOP-001:** Tech Stack Selection (framework alignment)
- **SOP-101:** Schema Design (next step)
