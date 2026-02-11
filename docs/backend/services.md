# Service Layer Design

**On 2026-02-11** (SOP-200: Service Layer)

## Overview

The service layer contains the business logic for Listly. Services orchestrate data access through repositories, enforce business rules, and implement the core features described in user stories. This layer sits between the API routes and the data access layer.

**Architecture Pattern:** Service-Repository Pattern

- Services contain business logic and orchestrate operations
- Repositories handle data access (to be implemented in SOP-201)
- API routes call services and handle HTTP concerns
- Clear separation of concerns

---

## Service Mapping

### Phase 1 MVP Services

| User Story                    | Service              | Method                    | Description                                               |
| ----------------------------- | -------------------- | ------------------------- | --------------------------------------------------------- |
| US-001: User can register     | AuthService          | register()                | Create account, hash password, create default preferences |
| US-002: User can login        | AuthService          | login()                   | Validate credentials, issue session token                 |
| US-003: User can use OAuth    | AuthService          | handleOAuthLogin()        | Process OAuth provider login (Google, Apple)              |
| US-001: Create shopping lists | ListService          | create()                  | Create new shopping list with validation                  |
| US-001: View multiple lists   | ListService          | getByUser()               | Retrieve user's lists with access control                 |
| US-001: Update list           | ListService          | update()                  | Update list details with ownership check                  |
| US-001: Delete list           | ListService          | delete()                  | Soft delete with owner-only validation                    |
| US-002: Add items to list     | ItemService          | create()                  | Add item with auto-categorization                         |
| US-002: Voice input           | ItemService          | createFromTranscription() | Parse and add item from voice input                       |
| US-003: Auto-categorize items | ItemService          | autoCategorizе()          | Assign category based on name patterns                    |
| US-004: Check off items       | ItemService          | toggleCheck()             | Mark item as complete/incomplete                          |
| US-004: Complete shopping     | ItemService          | completeList()            | Mark all items, record to history                         |
| US-005: Customize categories  | CategoryService      | updateStoreCategories()   | Customize aisle order per store                           |
| US-006: Share lists           | CollaborationService | share()                   | Send invitation to collaborator                           |
| US-006: Accept invitation     | CollaborationService | acceptInvitation()        | Join shared list                                          |
| US-007: Real-time updates     | CollaborationService | syncChanges()             | Handle real-time synchronization                          |
| US-008: Track contributions   | CollaborationService | getActivity()             | Show who added/checked items                              |
| US-009: Set budget            | ListService          | setBudget()               | Set and track budget for list                             |
| US-009: Track spending        | ItemService          | updatePrice()             | Record price when checking item                           |
| US-026: PWA install           | UserService          | updatePreferences()       | Update PWA install status                                 |

### Phase 2 Services (Deferred)

| User Story                  | Service             | Method              | Description                            |
| --------------------------- | ------------------- | ------------------- | -------------------------------------- |
| US-010: Record prices       | PriceHistoryService | recordPurchase()    | Save price history                     |
| US-011: Price comparison    | PriceHistoryService | compareStores()     | Show prices across stores              |
| US-012: Spending history    | AnalyticsService    | getSpendingReport() | Generate spending analytics            |
| US-016: Track pantry        | PantryService       | add()               | Add items to pantry inventory          |
| US-017: Expiration tracking | PantryService       | getExpiringSoon()   | Alert for items expiring within 3 days |
| US-018: Barcode scanning    | PantryService       | addFromBarcode()    | Identify and add scanned product       |
| US-019: Organize pantry     | PantryService       | getByCategory()     | Group items by category/location       |

### Phase 3 Services (Future)

| User Story                 | Service         | Method                  | Description                     |
| -------------------------- | --------------- | ----------------------- | ------------------------------- |
| US-013: AI suggestions     | AIService       | suggestItems()          | Predict items based on patterns |
| US-014: Smart suggestions  | AIService       | getComplementaryItems() | Suggest paired items            |
| US-015: Deal alerts        | AIService       | checkDeals()            | Alert for good prices           |
| US-020: Meal planning      | MealPlanService | planWeek()              | Assign recipes to calendar      |
| US-021: Save recipes       | RecipeService   | save()                  | Add recipe to collection        |
| US-022: Account for pantry | MealPlanService | generateList()          | Create list minus pantry items  |
| US-023: Import recipes     | RecipeService   | importFromUrl()         | Parse recipe from URL           |
| US-027: Location reminders | LocationService | checkNearbyStores()     | Trigger reminders near stores   |
| US-028: Location privacy   | LocationService | updatePermissions()     | Control location tracking       |
| US-029: Favorite stores    | StoreService    | addFavorite()           | Save favorite store locations   |

---

## Service Inventory

### MVP Services (Phase 1)

- **ListService** — Shopping list CRUD, budget tracking, templates, duplication
- **ItemService** — List item CRUD, check-off, auto-categorization, voice input parsing
- **CategoryService** — Category management, store-specific customization, usage statistics
- **CollaborationService** — List sharing, invitations, permissions, activity tracking
- **UserService** — User profile management, preferences, statistics
- **StoreService** — Store management, favorites, geolocation
- **AuthService** — User authentication, registration, session management (interface defined, uses existing lib/auth/)

### Phase 2 Services (Deferred)

- **PantryService** — Pantry inventory, expiration tracking, barcode scanning
- **PriceHistoryService** — Price recording, history, multi-store comparison
- **AnalyticsService** — Spending reports, trends, insights

### Phase 3 Services (Future)

- **AIService** — Purchase predictions, smart suggestions, deal alerts
- **MealPlanService** — Weekly planning, shopping list generation
- **RecipeService** — Recipe CRUD, URL import, categorization
- **LocationService** — Geofencing, store proximity, reminder triggers

### Shared Utilities

- **NotificationService** — Email/push notifications (partially implemented in CollaborationService)
- **StorageService** — File uploads for images, receipts (deferred)
- **CacheService** — Performance optimization (deferred)

> **Implementation Status:** See [traceability.md](./traceability.md) for detailed mapping of user stories to service methods and implementation status.

---

## Service Design Principles

### 1. Single Responsibility

Each service has a clear domain focus:

- **AuthService** handles ONLY authentication/authorization
- **ListService** handles ONLY shopping list operations
- **ItemService** handles ONLY list items (not lists themselves)

### 2. Business Logic Location

Services contain business rules, NOT repositories:

```typescript
// ❌ BAD: Business logic in repository
class ListRepository {
  async create(data) {
    if ((await this.countByOwner(data.ownerId)) >= 100) {
      throw new Error('Limit reached');
    }
    return prisma.list.create(data);
  }
}

// ✅ GOOD: Business logic in service
class ListService {
  async create(input) {
    const count = await this.listRepo.countByOwner(input.ownerId);
    if (count >= MAX_LISTS_PER_USER) {
      throw new ValidationError(
        `Maximum limit reached (${MAX_LISTS_PER_USER})`
      );
    }
    return this.listRepo.create(input);
  }
}
```

### 3. Thin Controllers, Fat Services

API routes should be thin orchestrators:

```typescript
// API Route (app/api/lists/route.ts)
export const POST = withErrorHandling(async (request) => {
  const session = await requireAuth();
  const data = await request.json();
  const list = await getListService().create({
    ...data,
    ownerId: session.user.id,
  });
  return NextResponse.json({ success: true, data: list }, { status: 201 });
});
```

### 4. Authorization in Services

Services enforce ownership and permissions:

```typescript
async delete(id: string, userId: string): Promise<void> {
  const list = await this.listRepo.findById(id);
  if (!list) {
    throw new NotFoundError('List not found');
  }

  // Business rule: Only owner can delete
  if (list.ownerId !== userId) {
    throw new ForbiddenError('Only the list owner can delete this list');
  }

  await this.listRepo.delete(id);
}
```

### 5. Transactional Operations

Services coordinate multi-step operations:

```typescript
async shareList(listId: string, ownerId: string, email: string): Promise<void> {
  // Multi-step operation wrapped in transaction
  return this.prisma.$transaction(async (tx) => {
    // 1. Verify ownership
    const list = await tx.shoppingList.findUnique({ where: { id: listId } });
    if (list.ownerId !== ownerId) {
      throw new ForbiddenError('Only owner can share');
    }

    // 2. Find or invite user
    const targetUser = await tx.user.findUnique({ where: { email } });
    if (!targetUser) {
      // Send invitation email
      await this.notificationService.sendInvitation(email, list.name);
      return;
    }

    // 3. Add collaborator
    await tx.listCollaborator.create({
      data: { listId, userId: targetUser.id, role: 'EDITOR' }
    });
  });
}
```

---

## Next Steps

1. **SOP-201: Repository Pattern** — Create data access layer with repository interfaces and implementations
2. **Refactor Services** — Update services to use repositories instead of direct Prisma calls
3. **API Routes Implementation** — Create REST endpoints that expose service methods
4. **Unit Tests** — Test services with mocked repositories
5. **Integration Tests** — Test API routes end-to-end

---

## Related Documentation

- [Requirements](/docs/requirements.md) — User stories
- [Database Schema](/docs/database/schema.md) — Data model
- [Design Patterns](/docs/architecture/patterns.md) — Architecture decisions
- [API Endpoints](/docs/api/endpoints.md) — REST API specification
- [Authorization](/docs/authorization.md) — Permission model
