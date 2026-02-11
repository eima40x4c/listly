# Business Rules

**On 2026-02-11** (SOP-200: Service Layer)

## Overview

This document defines the business rules enforced by the Listly application. Each rule is implemented in the service layer and ensures data consistency, enforces constraints, and maintains business logic integrity.

---

## Shopping List Rules

| Rule ID      | Rule                                                                  | Enforcement Location               | Validation                                 |
| ------------ | --------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| **LIST-001** | User can have maximum 100 active lists                                | `ListService.create()`             | Count existing lists before creation       |
| **LIST-002** | List name must be 100 characters or less                              | `ListService.create()`             | Validate input length                      |
| **LIST-003** | Only list owner can delete list                                       | `ListService.delete()`             | Check ownership before deletion            |
| **LIST-004** | Only list owner can update certain fields (name, description, status) | `ListService.update()`             | Check ownership for specific field updates |
| **LIST-005** | Budget must be a positive number                                      | `ListService.setBudget()`          | Validate budget >= 0                       |
| **LIST-006** | List status can be ACTIVE, COMPLETED, or ARCHIVED                     | `ListService.update()`             | Enum validation via Prisma schema          |
| **LIST-007** | Completed lists must have completedAt timestamp                       | `ListService.complete()`           | Set timestamp on status change             |
| **LIST-008** | Templates can be copied to create new lists                           | `ListService.createFromTemplate()` | Duplicate template items to new list       |
| **LIST-009** | List duplication preserves items but resets checked status            | `ListService.duplicate()`          | Copy items with isChecked = false          |
| **LIST-010** | User must have access (owner or collaborator) to view list            | `ListService.getById()`            | Check ownership or collaboration           |

---

## List Item Rules

| Rule ID      | Rule                                                | Enforcement Location                           | Validation                            |
| ------------ | --------------------------------------------------- | ---------------------------------------------- | ------------------------------------- |
| **ITEM-001** | List can have maximum 500 items                     | `ItemService.create()`                         | Count existing items before creation  |
| **ITEM-002** | Item name must be 200 characters or less            | `ItemService.create()`                         | Validate input length                 |
| **ITEM-003** | Items are auto-categorized if category not provided | `ItemService.create()`                         | Call `autoCategorizе()` method        |
| **ITEM-004** | Quantity defaults to 1 if not provided              | `ItemService.create()`                         | Set default in data creation          |
| **ITEM-005** | Priority defaults to 0 (normal) if not provided     | `ItemService.create()`                         | Set default in data creation          |
| **ITEM-006** | User must have list access to add/edit items        | `ItemService.create()`, `ItemService.update()` | Check list access before operation    |
| **ITEM-007** | Checked items record checkedAt timestamp            | `ItemService.toggleCheck()`                    | Set timestamp on check                |
| **ITEM-008** | Actual price can be recorded when checking item     | `ItemService.check()`                          | Update estimatedPrice with actual     |
| **ITEM-009** | Items maintain sort order within list               | `ItemService.create()`                         | Auto-increment sortOrder              |
| **ITEM-010** | Checked items display below unchecked items         | `ItemService.getByList()`                      | Order by isChecked ASC, sortOrder ASC |
| **ITEM-011** | Moving item to another list resets checked status   | `ItemService.moveToList()`                     | Set isChecked = false on move         |
| **ITEM-012** | Voice transcription parses quantity and units       | `ItemService.createFromTranscription()`        | Regex parsing of input string         |

---

## Category Rules

| Rule ID     | Rule                                            | Enforcement Location                                   | Validation                            |
| ----------- | ----------------------------------------------- | ------------------------------------------------------ | ------------------------------------- |
| **CAT-001** | Category slug must be unique                    | `CategoryService.create()`                             | Check existing before creation        |
| **CAT-002** | Default categories cannot be updated or deleted | `CategoryService.update()`, `CategoryService.delete()` | Check isDefault flag                  |
| **CAT-003** | Custom categories can be created by users       | `CategoryService.create()`                             | Allow creation with isDefault = false |
| **CAT-004** | Store categories can have custom aisle numbers  | `CategoryService.customizeForStore()`                  | Store-specific overrides              |
| **CAT-005** | Category order can be customized per store      | `CategoryService.updateStoreOrder()`                   | Update sortOrder by store             |
| **CAT-006** | Auto-categorization uses keyword matching       | `ItemService.autoCategorizе()`                         | Match item name against patterns      |

---

## Collaboration Rules

| Rule ID        | Rule                                                     | Enforcement Location                        | Validation                        |
| -------------- | -------------------------------------------------------- | ------------------------------------------- | --------------------------------- |
| **COLLAB-001** | List can have maximum 10 collaborators                   | `CollaborationService.share()`              | Count collaborators before adding |
| **COLLAB-002** | Only list owner can share list                           | `CollaborationService.share()`              | Check ownership before sharing    |
| **COLLAB-003** | User cannot be added as collaborator twice               | `CollaborationService.share()`              | Check existing collaboration      |
| **COLLAB-004** | Only list owner can remove collaborators                 | `CollaborationService.removeCollaborator()` | Check ownership                   |
| **COLLAB-005** | Only list owner can update collaborator roles            | `CollaborationService.updateRole()`         | Check ownership                   |
| **COLLAB-006** | Collaborator can leave list at any time                  | `CollaborationService.leaveList()`          | Allow self-removal                |
| **COLLAB-007** | Viewer role can only view list and items                 | `CollaborationService.hasPermission()`      | Check role for view permission    |
| **COLLAB-008** | Editor role can view and edit items                      | `CollaborationService.hasPermission()`      | Check role for edit permission    |
| **COLLAB-009** | Admin role has all permissions except ownership transfer | `CollaborationService.hasPermission()`      | Check role for admin permission   |
| **COLLAB-010** | List owner always has full permissions                   | `CollaborationService.hasPermission()`      | Owner bypass role check           |

---

## User Rules

| Rule ID      | Rule                                             | Enforcement Location          | Validation                       |
| ------------ | ------------------------------------------------ | ----------------------------- | -------------------------------- |
| **USER-001** | Email must be unique across all users            | User registration (auth)      | Database unique constraint       |
| **USER-002** | Password must be hashed before storage           | User registration (auth)      | Hash with bcrypt in auth layer   |
| **USER-003** | Email must be verified for certain features      | TBD                           | Check emailVerified flag         |
| **USER-004** | User can update own profile only                 | `UserService.updateProfile()` | Implicit - userId parameter      |
| **USER-005** | User preferences created with default values     | User registration             | Create preferences with defaults |
| **USER-006** | Inactive users cannot login                      | Authentication layer          | Check isActive flag              |
| **USER-007** | User deletion cascades to owned lists            | `UserService.deleteAccount()` | Database cascade on delete       |
| **USER-008** | User can search other users by email for sharing | `UserService.searchByEmail()` | Filter by isActive = true        |

---

## Store Rules

| Rule ID       | Rule                                             | Enforcement Location         | Validation                      |
| ------------- | ------------------------------------------------ | ---------------------------- | ------------------------------- |
| **STORE-001** | User can have multiple favorite stores           | `StoreService.addFavorite()` | Allow multiple favorites        |
| **STORE-002** | Favorite stores maintain sort order              | `StoreService.addFavorite()` | Auto-increment sortOrder        |
| **STORE-003** | Nearby stores calculated using Haversine formula | `StoreService.findNearby()`  | Geographic distance calculation |
| **STORE-004** | Default search radius is 10 kilometers           | `StoreService.findNearby()`  | Parameter default value         |
| **STORE-005** | Store coordinates are optional                   | `StoreService.create()`      | Nullable latitude/longitude     |

---

## Cross-Cutting Rules

| Rule ID        | Rule                                                      | Enforcement Location | Validation                      |
| -------------- | --------------------------------------------------------- | -------------------- | ------------------------------- |
| **GLOBAL-001** | All IDs use CUID format                                   | Database schema      | Prisma @default(cuid())         |
| **GLOBAL-002** | All entities have createdAt timestamp                     | Database schema      | Prisma @default(now())          |
| **GLOBAL-003** | All mutable entities have updatedAt timestamp             | Database schema      | Prisma @updatedAt               |
| **GLOBAL-004** | Soft delete preferred over hard delete (where applicable) | Service layer        | Use status/isActive flags       |
| **GLOBAL-005** | Transactions used for multi-step operations               | Service layer        | Wrap in prisma.$transaction()   |
| **GLOBAL-006** | Access control checked before all operations              | Service layer        | Verify ownership/collaboration  |
| **GLOBAL-007** | Input validation uses Zod schemas                         | API layer            | Validation in withErrorHandling |
| **GLOBAL-008** | Errors use standardized error classes                     | Service layer        | Throw AppError subclasses       |

---

## Auto-Categorization Patterns

### Category Mapping Keywords

| Category      | Keywords                                                         |
| ------------- | ---------------------------------------------------------------- |
| **Produce**   | apple, banana, orange, lettuce, tomato, carrot, fruit, vegetable |
| **Dairy**     | milk, cheese, yogurt, butter, cream, egg                         |
| **Meat**      | chicken, beef, pork, fish, turkey, lamb, meat                    |
| **Bakery**    | bread, bagel, croissant, roll, bun, cake                         |
| **Pantry**    | pasta, rice, flour, sugar, salt, pepper, oil, cereal             |
| **Beverages** | water, juice, soda, coffee, tea, beer, wine                      |
| **Frozen**    | ice cream, frozen, popsicle                                      |
| **Snacks**    | chips, crackers, cookies, candy, nuts                            |
| **Household** | paper towel, toilet paper, soap, detergent, cleaner              |

**Rule:** Item name is matched case-insensitively against keyword list. First match determines category.

---

## Future Business Rules (Deferred)

### Pantry Rules (Phase 2)

- **PANTRY-001:** Pantry items track expiration dates
- **PANTRY-002:** Items expiring within 3 days trigger alerts
- **PANTRY-003:** Barcode scanning identifies products
- **PANTRY-004:** Pantry quantity reduces when adding to shopping list

### Price History Rules (Phase 2)

- **PRICE-001:** Price history recorded when item checked with price
- **PRICE-002:** Price trends calculated from historical data
- **PRICE-003:** Multi-store price comparison available
- **PRICE-004:** Deal alerts when price drops below average

### AI Suggestion Rules (Phase 3)

- **AI-001:** Purchase patterns analyzed weekly
- **AI-002:** Items suggested based on frequency
- **AI-003:** Complementary items suggested based on current list
- **AI-004:** Deal alerts respect user preferences

### Meal Planning Rules (Phase 3)

- **MEAL-001:** Recipes can be assigned to meal plan days
- **MEAL-002:** Shopping list generated from meal plan ingredients
- **MEAL-003:** Pantry inventory deducted from shopping list
- **MEAL-004:** Recipe import parses ingredients from URLs

---

## Rule Implementation Examples

### Example 1: List Creation with Validation

```typescript
// ListService.create()
async create(input: ICreateListInput): Promise<ShoppingList> {
  // Business rule: LIST-001 - Maximum 100 lists
  const existingCount = await prisma.shoppingList.count({
    where: { ownerId: input.ownerId },
  });

  if (existingCount >= MAX_LISTS_PER_USER) {
    throw new ValidationError(`Maximum limit reached (${MAX_LISTS_PER_USER} lists)`);
  }

  // Business rule: LIST-002 - Name length validation
  if (input.name.length > MAX_LIST_NAME_LENGTH) {
    throw new ValidationError(`List name must be ${MAX_LIST_NAME_LENGTH} characters or less`);
  }

  // Create with defaults
  return prisma.shoppingList.create({ data: { ...input, status: 'ACTIVE' } });
}
```

### Example 2: Ownership Check

```typescript
// ListService.delete()
async delete(id: string, userId: string): Promise<void> {
  const list = await this.getById(id, userId);
  if (!list) {
    throw new NotFoundError('List not found');
  }

  // Business rule: LIST-003 - Only owner can delete
  if (list.ownerId !== userId) {
    throw new ForbiddenError('Only the list owner can delete this list');
  }

  await prisma.shoppingList.delete({ where: { id } });
}
```

### Example 3: Auto-Categorization

```typescript
// ItemService.create()
let categoryId = input.categoryId;
if (!categoryId) {
  // Business rule: ITEM-003 - Auto-categorize if not provided
  const categorySlug = await this.autoCategorizе(input.name);
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (category) {
      categoryId = category.id;
    }
  }
}
```

---

## Testing Business Rules

Each business rule should have corresponding unit tests:

```typescript
describe('LIST-001: Maximum lists per user', () => {
  it('should allow creating lists up to the limit', async () => {
    // Create 100 lists
    // Expect success
  });

  it('should reject creating 101st list', async () => {
    // Create 100 lists
    // Attempt to create 101st
    // Expect ValidationError
  });
});
```

---

## Related Documentation

- [Service Layer Design](/docs/backend/services.md) — Service architecture
- [Requirements](/docs/requirements.md) — User stories and acceptance criteria
- [Authorization](/docs/authorization.md) — Permission model
- [Validation](/src/lib/validation/) — Input validation schemas
