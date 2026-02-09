# Database Decision: Listly

**Decision Date:** 2026-02-09  
**Decision Status:** ✅ Approved  
**SOP Reference:** SOP-100 (Database Selection)

---

## Executive Summary

**Selected:** PostgreSQL 16 + Supabase + Prisma ORM

**Rationale:** PostgreSQL provides the optimal balance of relational data modeling, query complexity support, real-time capabilities via Supabase, and cost-effectiveness for our MVP and scaling needs. Prisma ORM ensures type-safe database access with excellent developer experience.

---

## Data Requirements Analysis

### Data Characteristics

| Characteristic       | Assessment                          | Impact on Choice                  |
| -------------------- | ----------------------------------- | --------------------------------- |
| **Data Structure**   | Highly structured and relational    | ✅ Requires SQL database          |
| **Relationships**    | Complex multi-table relationships   | ✅ Requires JOIN support          |
| **Volume (MVP)**     | <500 users, ~1GB data               | ✅ Any modern DB handles this     |
| **Volume (Year 1)**  | ~5,000 users, ~10GB data            | ✅ Requires scalable solution     |
| **Access Pattern**   | 90% reads, 10% writes               | ✅ Optimize for read performance  |
| **Transactions**     | Budget tracking, collaboration sync | ✅ Requires ACID compliance       |
| **Query Complexity** | Aggregations, trends, filtering     | ✅ Requires complex query support |
| **Real-time Needs**  | Collaborative list editing          | ✅ Requires pub/sub or CDC        |

### Core Data Entities

```
Users
├── Lists (many-to-many via ListCollaborators)
│   ├── Items
│   │   └── ItemHistory (prices, completions)
│   └── ListSettings (budget, categories)
├── PantryItems
│   └── ExpirationTracking
├── Recipes
│   └── RecipeIngredients
├── ShoppingHistory
│   └── PurchaseRecords
└── UserPreferences
```

**Why Relational:**

- Clear entity boundaries with well-defined relationships
- Need for referential integrity (cascading deletes, foreign keys)
- Complex queries across multiple tables (e.g., "Show spending by category for shared lists")
- Transaction requirements for budget consistency

---

## Decision Matrix

### Database Type Evaluation

| Criteria                     | Weight | PostgreSQL | MongoDB  | SQLite   | Score Calculation           |
| ---------------------------- | ------ | ---------- | -------- | -------- | --------------------------- |
| **Data structure fit**       | 25%    | 5          | 3        | 4        | PostgreSQL: 5 × 0.25 = 1.25 |
| **Query complexity support** | 20%    | 5          | 3        | 4        | PostgreSQL: 5 × 0.20 = 1.00 |
| **Scaling requirements**     | 15%    | 5          | 5        | 2        | PostgreSQL: 5 × 0.15 = 0.75 |
| **Team expertise**           | 15%    | 5          | 3        | 4        | PostgreSQL: 5 × 0.15 = 0.75 |
| **Hosting cost**             | 10%    | 5          | 4        | 5        | PostgreSQL: 5 × 0.10 = 0.50 |
| **Ecosystem (ORM/tools)**    | 10%    | 5          | 4        | 4        | PostgreSQL: 5 × 0.10 = 0.50 |
| **Time to implement**        | 5%     | 5          | 4        | 3        | PostgreSQL: 5 × 0.05 = 0.25 |
| **Weighted Total**           | 100%   | **4.85**   | **3.50** | **3.55** | **PostgreSQL wins**         |

### Scoring Rationale

**PostgreSQL Strengths:**

- Perfect fit for structured, relational data (Users → Lists → Items → History)
- Powerful SQL with JOINs, CTEs, window functions for complex analytics
- ACID transactions ensure data consistency for budgets and collaboration
- Proven scalability to millions of users (Instagram, Reddit use PostgreSQL)
- Rich ecosystem: Prisma, PostGIS for future location features, full-text search
- Excellent JSON support (jsonb) for flexible fields if needed

**MongoDB Consideration:**

- Could model as nested documents (List { items: [...] })
- However, this denormalizes data unnecessarily
- Poor fit for multi-table JOINs (price history, user analytics)
- Aggregation pipeline more complex than SQL for our use cases

**SQLite Consideration:**

- Excellent for offline-first (embedded in app)
- However, requires API wrapper for multi-user access
- Limited concurrent write performance for real-time collaboration
- Migration path to PostgreSQL later adds complexity

---

## Selected Database: PostgreSQL 16

### Why PostgreSQL

1. **Relational Model Match**
   - Our domain is inherently relational (users have lists, lists have items)
   - Foreign keys enforce referential integrity automatically
   - JOINs make complex queries elegant (e.g., "total spent by category across shared lists")

2. **Query Capabilities**
   - Advanced SQL: CTEs, window functions, subqueries
   - Full-text search for item suggestions (no external search engine needed)
   - JSON support (jsonb) for flexible metadata (item attributes, recipe details)
   - Array types for categorical data (tags, categories)

3. **ACID Transactions**
   - Critical for budget tracking (ensure price + total + history consistency)
   - Multi-user collaboration (optimistic locking, row-level security)
   - Atomic operations for complex workflows (complete shopping trip)

4. **Performance**
   - Read optimization via indexes, materialized views
   - Efficient for our 90% read / 10% write pattern
   - Connection pooling handles concurrent users

5. **Ecosystem**
   - Prisma ORM: Type-safe queries, migrations, great DX
   - Supabase: Real-time pub/sub via CDC (Change Data Capture)
   - Extensions: pg_trgm (fuzzy search), pg_cron (scheduled tasks)

6. **Scalability Path**
   - Vertical scaling: Supabase plans up to dedicated instances
   - Read replicas: For analytics and reporting
   - Partitioning: For large tables (history, analytics)
   - Proven at scale: Instagram, Reddit, Twitch use PostgreSQL

### Version: PostgreSQL 16

**Why PostgreSQL 16:**

- Latest stable release with performance improvements
- Enhanced JSON query performance (important for flexible fields)
- Improved logical replication (Supabase real-time uses this)
- Better query parallelism for analytics queries

---

## Selected Hosting: Supabase

### Why Supabase

1. **Free Tier Generosity**
   - 500MB database storage (sufficient for MVP with ~500 users)
   - 2GB data transfer/month
   - Up to 50MB file storage (for recipe images, user avatars)
   - 50,000 monthly active users on auth
   - **Cost: $0/month for MVP**

2. **Real-Time Built-In**
   - PostgreSQL Change Data Capture (CDC) for real-time subscriptions
   - Broadcast channels for ephemeral events (typing indicators, presence)
   - No separate WebSocket infrastructure needed
   - **Critical for US-007:** Real-time collaboration requirement (<2s sync)

3. **Integrated Services**
   - **Auth:** Email/password, OAuth (Google, Apple), magic links
   - **Storage:** S3-compatible for images (recipe photos, item images)
   - **Edge Functions:** Serverless compute for background jobs
   - **Row-Level Security:** Built-in multi-tenancy via PostgreSQL RLS

4. **Developer Experience**
   - Auto-generated REST API (if needed as backup to Prisma)
   - SQL Editor with query history
   - Real-time database explorer
   - Migration history and rollback UI

5. **Scaling Path**
   - **$25/month (Pro):** 8GB database, 50GB transfer, daily backups
   - **$599/month (Team):** Dedicated compute, custom domains
   - **Custom (Enterprise):** Read replicas, multi-region
   - Clear migration path as we grow

6. **Open Source**
   - Self-hosting option if we outgrow managed service
   - No vendor lock-in (standard PostgreSQL + PostgREST)
   - Active community and fast feature development

### Alternatives Considered

| Provider            | Free Tier                           | Pros                       | Rejected Because                                        |
| ------------------- | ----------------------------------- | -------------------------- | ------------------------------------------------------- |
| **Neon**            | 0.5GB, serverless PostgreSQL        | Excellent cold-start times | Smaller free tier, no built-in real-time                |
| **Railway**         | $5 credit/month                     | Redis included             | No built-in real-time, requires payment                 |
| **PlanetScale**     | 5GB, MySQL                          | Excellent branching model  | MySQL (prefer PostgreSQL features), no native real-time |
| **AWS RDS**         | Free tier (750hrs/month for 1 year) | Industry standard          | Complex setup, no free tier after year 1                |
| **Heroku Postgres** | 1GB (deprecated)                    | Simple deployment          | Free tier removed, expensive at scale                   |

**Decision:** Supabase provides the best combination of generous free tier, built-in real-time, and integrated services (auth, storage). The PostgreSQL CDC-based real-time is more reliable than third-party WebSocket services.

---

## Selected ORM: Prisma 5

### Why Prisma

1. **Type Safety**
   - Auto-generated TypeScript types from schema
   - Compile-time query validation (catch errors before runtime)
   - IntelliSense for all database queries
   - **Example:**
     ```typescript
     // Auto-completion for all fields
     const list = await prisma.list.findUnique({
       where: { id: listId },
       include: { items: true, collaborators: true },
     });
     // list.items[0]. <- IntelliSense shows all Item fields
     ```

2. **Migrations**
   - Declarative schema in `schema.prisma`
   - `prisma migrate dev` generates SQL migrations automatically
   - Version-controlled migration history
   - Rollback support with `prisma migrate resolve`

3. **Developer Experience**
   - Prisma Studio: Visual database editor
   - Introspection: Generate schema from existing database
   - Seeding: Built-in data seeding for development/testing
   - Excellent error messages (clear explanations with fixes)

4. **Performance**
   - Efficient query generation (no N+1 problems with proper includes)
   - Connection pooling built-in
   - Query batching and caching support
   - Prepared statements prevent SQL injection

5. **Ecosystem**
   - First-class Next.js support
   - Works seamlessly with Supabase PostgreSQL
   - Large community (50k+ GitHub stars)
   - Extensive documentation and examples

6. **Advanced Features**
   - Relation filters: `where: { items: { some: { completed: false } } }`
   - Transactions: `prisma.$transaction([...])`
   - Raw SQL fallback: `prisma.$queryRaw` for complex queries
   - Middleware: Logging, soft deletes, audit trails

### Alternatives Considered

| ORM         | Pros                           | Rejected Because                               |
| ----------- | ------------------------------ | ---------------------------------------------- |
| **Drizzle** | Lighter weight, SQL-like API   | Newer ecosystem, less mature migrations        |
| **TypeORM** | Decorator-based, mature        | More boilerplate, less type-safe               |
| **Kysely**  | Excellent TypeScript inference | More manual work, no migration tooling         |
| **Raw SQL** | Maximum control                | No type safety, manual migrations, error-prone |

**Decision:** Prisma offers the best balance of type safety, developer experience, and tooling maturity. The auto-generated client and migration system significantly reduce development time and bugs.

---

## Data Access Strategy

### Repository Pattern with Prisma

We'll implement the Repository Pattern (as defined in `/docs/architecture/patterns.md`) using Prisma as the underlying data access layer:

```typescript
// src/lib/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaClient) {}

  abstract create(data: unknown): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract update(id: string, data: unknown): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

// src/lib/repositories/list.repository.ts
export class ListRepository extends BaseRepository<List> {
  async create(data: { name: string; userId: string }): Promise<List> {
    return this.prisma.list.create({
      data: {
        name: data.name,
        owner: { connect: { id: data.userId } },
      },
    });
  }

  async findByUserId(userId: string): Promise<List[]> {
    return this.prisma.list.findMany({
      where: {
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      },
      include: { items: true, collaborators: true },
    });
  }
}
```

**Benefits:**

- Centralized database logic (easy to test and maintain)
- Abstraction over Prisma (easier to swap ORM if needed)
- Consistent error handling and validation
- Follows patterns established in SOP-005

---

## Real-Time Strategy

### Supabase Realtime via PostgreSQL CDC

Supabase Realtime uses PostgreSQL's logical replication to broadcast database changes:

```typescript
// Subscribe to real-time changes on a list
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const channel = supabase
  .channel('list-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'Item',
      filter: `listId=eq.${listId}`,
    },
    (payload) => {
      console.log('Item changed:', payload);
      // Update local state (Zustand store)
      updateItemInStore(payload.new);
    }
  )
  .subscribe();
```

**How it works:**

1. User A adds an item via Prisma → PostgreSQL INSERT
2. PostgreSQL replication slot captures change
3. Supabase broadcasts change via WebSocket
4. User B receives change event → updates UI

**Benefits:**

- **Single source of truth:** Database is authoritative
- **No sync bugs:** Real-time updates are guaranteed consistent with DB
- **Automatic:** No manual event publishing needed
- **Efficient:** Only subscribed clients receive updates

**Handles US-007 requirement:** Real-time collaboration with <2s sync time.

---

## Offline Strategy

### Client-Side Sync with IndexedDB + Service Worker

While Supabase provides real-time, offline support requires client-side queuing:

```typescript
// Offline write queue
const offlineQueue = {
  addItem: async (item: Item) => {
    if (navigator.onLine) {
      return prisma.item.create({ data: item });
    } else {
      await indexedDB.add('pending-writes', {
        type: 'CREATE_ITEM',
        data: item,
      });
      return item; // Optimistic update
    }
  },
};

// Service worker: Sync on reconnection
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-writes') {
    event.waitUntil(syncPendingWrites());
  }
});

async function syncPendingWrites() {
  const pending = await indexedDB.getAll('pending-writes');
  for (const write of pending) {
    await fetch('/api/sync', { method: 'POST', body: JSON.stringify(write) });
    await indexedDB.delete('pending-writes', write.id);
  }
}
```

**Handles US-024 and US-025:** Offline functionality with background sync.

---

## Cost Projection

### MVP (0-500 users)

| Service           | Plan                | Cost         |
| ----------------- | ------------------- | ------------ |
| Supabase Database | Free Tier (500MB)   | $0/month     |
| Supabase Auth     | Free Tier (50k MAU) | $0/month     |
| Supabase Storage  | Free Tier (1GB)     | $0/month     |
| **Total**         |                     | **$0/month** |

### Growth Phase (500-5,000 users)

| Service           | Plan                     | Cost          |
| ----------------- | ------------------------ | ------------- |
| Supabase Database | Pro (8GB, daily backups) | $25/month     |
| Supabase Auth     | Pro (100k MAU)           | Included      |
| Supabase Storage  | Pro (100GB)              | Included      |
| **Total**         |                          | **$25/month** |

### Scale Phase (5,000-50,000 users)

| Service           | Plan                     | Cost           |
| ----------------- | ------------------------ | -------------- |
| Supabase Database | Team (dedicated compute) | $599/month     |
| Supabase Auth     | Team (1M MAU)            | Included       |
| Supabase Storage  | Team (unlimited)         | Included       |
| **Total**         |                          | **$599/month** |

**Comparison:**

- MongoDB Atlas equivalent: $57-$600/month (comparable)
- AWS RDS PostgreSQL: $50-$1,000/month (more expensive, no free tier)
- Firebase Firestore: $0-$500/month (comparable, but less control)

**Conclusion:** Supabase provides the most generous free tier and competitive scaling costs.

---

## Migration Path

### If We Outgrow Supabase

Supabase is built on open-source tools, making migration straightforward:

1. **Self-hosted Supabase:** Deploy to AWS/GCP/Azure
   - PostgreSQL + PostgREST + Realtime Server
   - Full control, lower cost at high scale
   - Tools: Docker Compose, Kubernetes

2. **Managed PostgreSQL:** Migrate to dedicated provider
   - AWS RDS, GCP Cloud SQL, Azure Database for PostgreSQL
   - Keep Prisma ORM (no code changes)
   - Replace Supabase Realtime with Pusher or custom WebSocket

3. **Sharding/Federation:** For >1M users
   - Partition by user/region
   - Multi-tenant with separate databases per major customer
   - Prisma supports multiple database connections

**Lock-in Risk:** **Low** - Standard PostgreSQL with standard SQL. Only Supabase-specific APIs are Auth and Realtime, which have alternatives (NextAuth.js, Pusher).

---

## Security Considerations

### Row-Level Security (RLS)

Supabase PostgreSQL RLS ensures multi-tenancy security:

```sql
-- Users can only read lists they own or are invited to
CREATE POLICY "Users can read their own lists"
  ON lists FOR SELECT
  USING (
    auth.uid() = owner_id OR
    auth.uid() IN (
      SELECT user_id FROM list_collaborators WHERE list_id = lists.id
    )
  );

-- Users can only modify items in their lists
CREATE POLICY "Users can modify items in their lists"
  ON items FOR ALL
  USING (
    list_id IN (
      SELECT id FROM lists WHERE owner_id = auth.uid()
      UNION
      SELECT list_id FROM list_collaborators WHERE user_id = auth.uid()
    )
  );
```

**Benefits:**

- Security at database level (can't bypass in code)
- Multi-tenancy without complex app logic
- Works with Prisma and Supabase client

### Connection Security

- ✅ SSL/TLS enforced for all connections
- ✅ Connection pooling (prevents connection exhaustion attacks)
- ✅ API keys (Supabase anon key with RLS, service role key server-only)
- ✅ Prepared statements (Prisma prevents SQL injection)

---

## Performance Optimization

### Indexing Strategy

```sql
-- Indexes for common queries
CREATE INDEX idx_items_list_id ON items(list_id);
CREATE INDEX idx_items_completed ON items(completed);
CREATE INDEX idx_list_collaborators_user_id ON list_collaborators(user_id);
CREATE INDEX idx_list_collaborators_list_id ON list_collaborators(list_id);
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_expiration ON pantry_items(expiration_date);

-- Composite index for filtering completed items by list
CREATE INDEX idx_items_list_completed ON items(list_id, completed);

-- Full-text search for item names
CREATE INDEX idx_items_name_fts ON items USING GIN(to_tsvector('english', name));
```

### Query Optimization

- **Use `include` instead of separate queries** (avoid N+1)
- **Pagination** for large lists (cursor-based with Prisma)
- **Materialized views** for analytics (weekly spending trends)
- **Caching** with Redis (if needed later) for frequently accessed data

---

## Testing Strategy

### Database Testing

1. **Unit Tests:** Repository methods with in-memory SQLite

   ```typescript
   // tests/repositories/list.repository.test.ts
   import { PrismaClient } from '@prisma/client';
   import { ListRepository } from '@/lib/repositories/list.repository';

   const prisma = new PrismaClient({
     datasources: { db: { url: 'file::memory:' } },
   });
   const listRepo = new ListRepository(prisma);

   test('creates a list', async () => {
     const list = await listRepo.create({
       name: 'Groceries',
       userId: 'user123',
     });
     expect(list.name).toBe('Groceries');
   });
   ```

2. **Integration Tests:** Real PostgreSQL via Docker

   ```yaml
   # docker-compose.test.yml
   services:
     postgres-test:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: listly_test
         POSTGRES_USER: test
         POSTGRES_PASSWORD: test
   ```

3. **Seed Data:** Consistent test fixtures
   ```typescript
   // prisma/seed.ts
   const testUser = await prisma.user.create({
     data: { email: 'test@example.com', name: 'Test User' },
   });
   ```

---

## Backup & Disaster Recovery

### Supabase Backups

- **Free Tier:** No automatic backups (must use `pg_dump` manually)
- **Pro Tier ($25/month):** Daily backups, 7-day retention
- **Team Tier ($599/month):** Point-in-time recovery (PITR)

### Manual Backup (Free Tier)

```bash
# Backup script (run daily via cron)
pg_dump -h db.supabase.co -U postgres -d listly > backups/listly-$(date +%Y%m%d).sql
```

### Recovery Plan

1. **Data corruption:** Restore from daily backup (max 24hr data loss)
2. **Supabase outage:** Switch to read-only mode (use cached data)
3. **Complete failure:** Restore to new Supabase project or self-hosted PostgreSQL

---

## Implementation Checklist

- [ ] Set up Supabase project
- [ ] Configure connection string in `.env`
- [ ] Install Prisma: `pnpm add prisma @prisma/client`
- [ ] Initialize Prisma: `pnpm prisma init`
- [ ] Design schema (see SOP-101)
- [ ] Create migrations: `pnpm prisma migrate dev`
- [ ] Generate Prisma Client: `pnpm prisma generate`
- [ ] Implement repository pattern
- [ ] Set up Supabase Realtime client
- [ ] Configure Row-Level Security policies
- [ ] Implement offline queue with IndexedDB
- [ ] Write integration tests
- [ ] Set up backup strategy

---

## Summary

| Decision Area     | Selection                          | Rationale                                                       |
| ----------------- | ---------------------------------- | --------------------------------------------------------------- |
| **Database Type** | PostgreSQL 16                      | Perfect for relational data, ACID transactions, complex queries |
| **Hosting**       | Supabase                           | Generous free tier, built-in real-time, integrated auth/storage |
| **ORM**           | Prisma 5                           | Type-safe, excellent DX, seamless migrations                    |
| **Real-Time**     | Supabase Realtime (PostgreSQL CDC) | Database-driven consistency, no separate service                |
| **Offline**       | IndexedDB + Service Worker         | Standard PWA approach, background sync                          |

**Total Cost:**

- MVP (0-500 users): **$0/month**
- Growth (500-5,000 users): **$25/month**
- Scale (5,000-50,000 users): **$599/month**

**Next Steps:**

1. ✅ Database decision documented (this file)
2. ⏭️ Proceed to SOP-101 (Schema Design)
3. ⏭️ Proceed to SOP-103 (Seed Data)

---

**Document Owner:** AI Development Agent  
**Last Updated:** 2026-02-09  
**Review Date:** After MVP launch (evaluate performance and costs)
