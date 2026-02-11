# Requirements Traceability Matrix

**On 2026-02-11** (SOP-200: Service Layer)

## Overview

This document traces user stories from requirements through implementation. Each user story maps to specific service methods, repositories (to be implemented in SOP-201), API endpoints (to be implemented), and tests (to be implemented).

---

## Epic 1: Shopping List Management

| User Story                                  | Service Method                          | Business Rule                | API Endpoint                              | Test File                  | Status           |
| ------------------------------------------- | --------------------------------------- | ---------------------------- | ----------------------------------------- | -------------------------- | ---------------- |
| **US-001:** Create multiple shopping lists  | `ListService.create()`                  | LIST-001, LIST-002           | `POST /api/v1/lists`                      | `list.service.test.ts`     | ✅ Service Ready |
| **US-001:** View all lists with item counts | `ListService.getByUser()`               | LIST-010                     | `GET /api/v1/lists`                       | `list.service.test.ts`     | ✅ Service Ready |
| **US-002:** Add items by typing             | `ItemService.create()`                  | ITEM-001, ITEM-002, ITEM-003 | `POST /api/v1/lists/:id/items`            | `item.service.test.ts`     | ✅ Service Ready |
| **US-002:** Add items by voice              | `ItemService.createFromTranscription()` | ITEM-012                     | `POST /api/v1/lists/:id/items/voice`      | `item.service.test.ts`     | ✅ Service Ready |
| **US-002:** Item suggestions from history   | TBD (Phase 2)                           | -                            | -                                         | -                          | ⏳ Deferred      |
| **US-003:** Auto-categorize items by aisle  | `ItemService.autoCategorizе()`          | CAT-006                      | Automatic in create                       | `item.service.test.ts`     | ✅ Service Ready |
| **US-003:** Sort items by store aisle order | `ItemService.getByList()`               | ITEM-010                     | `GET /api/v1/lists/:id/items`             | `item.service.test.ts`     | ✅ Service Ready |
| **US-004:** Check off items while shopping  | `ItemService.toggleCheck()`             | ITEM-007                     | `PATCH /api/v1/items/:id/check`           | `item.service.test.ts`     | ✅ Service Ready |
| **US-004:** Mark shopping complete          | `ItemService.completeList()`            | ITEM-007                     | `POST /api/v1/lists/:id/complete`         | `item.service.test.ts`     | ✅ Service Ready |
| **US-005:** Customize aisle categories      | `CategoryService.customizeForStore()`   | CAT-004, CAT-005             | `POST /api/v1/stores/:id/categories`      | `category.service.test.ts` | ✅ Service Ready |
| **US-005:** Reorder categories              | `CategoryService.updateStoreOrder()`    | CAT-005                      | `PUT /api/v1/stores/:id/categories/order` | `category.service.test.ts` | ✅ Service Ready |

---

## Epic 2: Real-Time Collaboration

| User Story                                          | Service Method                               | Business Rule                      | API Endpoint                            | Test File                       | Status           |
| --------------------------------------------------- | -------------------------------------------- | ---------------------------------- | --------------------------------------- | ------------------------------- | ---------------- |
| **US-006:** Share list with family                  | `CollaborationService.share()`               | COLLAB-001, COLLAB-002, COLLAB-003 | `POST /api/v1/lists/:id/share`          | `collaboration.service.test.ts` | ✅ Service Ready |
| **US-006:** Accept shared list invitation           | `CollaborationService.acceptInvitation()`    | -                                  | `POST /api/v1/invitations/:code/accept` | `collaboration.service.test.ts` | 🔨 To Implement  |
| **US-007:** Real-time updates when others add items | Real-time sync (Supabase)                    | -                                  | WebSocket/SSE                           | -                               | ⏳ Deferred      |
| **US-007:** Real-time updates when items checked    | Real-time sync (Supabase)                    | -                                  | WebSocket/SSE                           | -                               | ⏳ Deferred      |
| **US-008:** See who added items                     | `ItemService.getByList()` (includes addedBy) | -                                  | `GET /api/v1/lists/:id/items`           | `item.service.test.ts`          | ✅ Service Ready |
| **US-008:** View activity history                   | `CollaborationService.getActivity()`         | -                                  | `GET /api/v1/lists/:id/activity`        | `collaboration.service.test.ts` | ✅ Service Ready |

---

## Epic 3: Budget & Price Tracking

| User Story                                 | Service Method                     | Business Rule | API Endpoint                     | Test File              | Status           |
| ------------------------------------------ | ---------------------------------- | ------------- | -------------------------------- | ---------------------- | ---------------- |
| **US-009:** Set budget for shopping trip   | `ListService.setBudget()`          | LIST-005      | `PATCH /api/v1/lists/:id/budget` | `list.service.test.ts` | ✅ Service Ready |
| **US-009:** Track spending as items added  | `ItemService.getEstimatedTotal()`  | -             | `GET /api/v1/lists/:id/total`    | `item.service.test.ts` | ✅ Service Ready |
| **US-009:** Budget warning when exceeded   | Client-side logic                  | LIST-005      | -                                | -                      | ⏳ Frontend      |
| **US-010:** Record prices when shopping    | `ItemService.check()` (with price) | ITEM-008      | `PATCH /api/v1/items/:id/check`  | `item.service.test.ts` | ✅ Service Ready |
| **US-010:** View price history             | TBD (Phase 2)                      | PRICE-001     | `GET /api/v1/items/:id/prices`   | -                      | ⏳ Deferred      |
| **US-011:** Price comparison across stores | TBD (Phase 2)                      | PRICE-003     | `GET /api/v1/items/:id/compare`  | -                      | ⏳ Deferred      |
| **US-012:** Spending history and trends    | TBD (Phase 2)                      | PRICE-002     | `GET /api/v1/analytics/spending` | -                      | ⏳ Deferred      |

---

## Epic 4: AI-Powered Suggestions (Phase 3 - Deferred)

| User Story                                      | Service Method | Business Rule     | API Endpoint                        | Test File | Status      |
| ----------------------------------------------- | -------------- | ----------------- | ----------------------------------- | --------- | ----------- |
| **US-013:** AI suggests items based on patterns | TBD            | AI-001, AI-002    | `GET /api/v1/suggestions`           | -         | ⏳ Deferred |
| **US-014:** Smart complementary suggestions     | TBD            | AI-003            | `GET /api/v1/lists/:id/suggestions` | -         | ⏳ Deferred |
| **US-015:** Deal alerts for good prices         | TBD            | AI-004, PRICE-004 | WebSocket/Push                      | -         | ⏳ Deferred |

---

## Epic 5: Pantry Inventory (Phase 2 - Deferred)

| User Story                                       | Service Method | Business Rule | API Endpoint                          | Test File | Status      |
| ------------------------------------------------ | -------------- | ------------- | ------------------------------------- | --------- | ----------- |
| **US-016:** Track pantry inventory               | TBD            | PANTRY-001    | `POST /api/v1/pantry`                 | -         | ⏳ Deferred |
| **US-016:** Warning for duplicate items          | TBD            | PANTRY-004    | Client-side check                     | -         | ⏳ Deferred |
| **US-017:** Track expiration dates               | TBD            | PANTRY-002    | `PATCH /api/v1/pantry/:id`            | -         | ⏳ Deferred |
| **US-017:** Alert for expiring items             | TBD            | PANTRY-002    | `GET /api/v1/pantry/expiring`         | -         | ⏳ Deferred |
| **US-018:** Barcode scanning                     | TBD            | PANTRY-003    | `POST /api/v1/pantry/scan`            | -         | ⏳ Deferred |
| **US-019:** Organize pantry by category/location | TBD            | -             | `GET /api/v1/pantry?groupBy=category` | -         | ⏳ Deferred |

---

## Epic 6: Meal Planning (Phase 3 - Deferred)

| User Story                                        | Service Method | Business Rule      | API Endpoint                                | Test File | Status      |
| ------------------------------------------------- | -------------- | ------------------ | ------------------------------------------- | --------- | ----------- |
| **US-020:** Plan meals for the week               | TBD            | MEAL-001           | `POST /api/v1/meal-plans`                   | -         | ⏳ Deferred |
| **US-020:** Generate shopping list from meal plan | TBD            | MEAL-002, MEAL-003 | `POST /api/v1/meal-plans/:id/generate-list` | -         | ⏳ Deferred |
| **US-021:** Save and organize recipes             | TBD            | -                  | `POST /api/v1/recipes`                      | -         | ⏳ Deferred |
| **US-022:** Account for pantry in generated list  | TBD            | MEAL-003           | Logic in generate-list                      | -         | ⏳ Deferred |
| **US-023:** Import recipes from URLs              | TBD            | MEAL-004           | `POST /api/v1/recipes/import`               | -         | ⏳ Deferred |

---

## Epic 7: Offline-First & Background Sync (PWA)

| User Story                                     | Service Method              | Business Rule | API Endpoint    | Test File | Status      |
| ---------------------------------------------- | --------------------------- | ------------- | --------------- | --------- | ----------- |
| **US-024:** App works offline                  | Service Workers + IndexedDB | -             | Client-side     | -         | ⏳ Deferred |
| **US-025:** Offline changes sync automatically | Background Sync API         | -             | Client-side     | -         | ⏳ Deferred |
| **US-026:** PWA installable on home screen     | `next-pwa` configuration    | -             | `manifest.json` | -         | ⏳ Deferred |

---

## Epic 8: Location-Based Reminders (Phase 4 - Deferred)

| User Story                                  | Service Method                    | Business Rule        | API Endpoint                         | Test File               | Status           |
| ------------------------------------------- | --------------------------------- | -------------------- | ------------------------------------ | ----------------------- | ---------------- |
| **US-027:** Reminders near stores           | TBD                               | STORE-003            | Geolocation API                      | -                       | ⏳ Deferred      |
| **US-028:** Control location tracking       | `UserService.updatePreferences()` | -                    | `PATCH /api/v1/users/me/preferences` | `user.service.test.ts`  | ✅ Service Ready |
| **US-029:** Define favorite store locations | `StoreService.addFavorite()`      | STORE-001, STORE-002 | `POST /api/v1/stores/:id/favorite`   | `store.service.test.ts` | ✅ Service Ready |

---

## Service Coverage Summary

| Service                  | User Stories Covered                   | Methods Implemented                                                                                                                                                                                   | Status                                 |
| ------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **ListService**          | US-001, US-009                         | create, getByUser, getById, update, delete, setBudget, complete, archive, duplicate, createFromTemplate, getTemplates, hasAccess, getOwner                                                            | ✅ Complete                            |
| **ItemService**          | US-002, US-003, US-004, US-009, US-010 | create, createMany, createFromTranscription, getById, getByList, update, delete, toggleCheck, check, uncheck, completeList, autoCategorizе, reorder, moveToList, getUncheckedCount, getEstimatedTotal | ✅ Complete                            |
| **CategoryService**      | US-003, US-005                         | getDefaults, getByStore, getBySlug, create, update, delete, customizeForStore, updateStoreOrder, search, getUsageStats, findBestMatch                                                                 | ✅ Complete                            |
| **CollaborationService** | US-006, US-007, US-008                 | share, acceptInvitation, removeCollaborator, updateRole, leaveList, getCollaborators, getSharedLists, hasPermission, getActivity, logActivity, validateInvitation, generateInvitationLink             | ⚠️ Partial (invitation system pending) |
| **UserService**          | US-028                                 | getById, getByEmail, updateProfile, updatePreferences, getPreferences, deleteAccount, getStats, searchByEmail, exists, verifyEmail, updateAvatar                                                      | ✅ Complete                            |
| **StoreService**         | US-029                                 | getAll, getById, search, findNearby, create, update, delete, addFavorite, removeFavorite, getFavorites, reorderFavorites, isFavorite, getByChain                                                      | ✅ Complete                            |

---

## Implementation Status Legend

| Symbol | Status       | Description                                          |
| ------ | ------------ | ---------------------------------------------------- |
| ✅     | Complete     | Service implemented and ready for testing            |
| 🔨     | To Implement | Service method defined but needs full implementation |
| ⏳     | Deferred     | Feature deferred to future phase                     |
| ❌     | Blocked      | Blocked by missing dependency                        |

---

## Next Steps

### Immediate (Phase 1 - MVP)

1. **Implement Repository Layer** (SOP-201) — Data access abstraction
2. **Create API Routes** — Expose service methods via REST endpoints
3. **Add Unit Tests** — Test each service method
4. **Add Integration Tests** — Test API endpoints with database
5. **Implement Real-Time Sync** — WebSocket/SSE for collaboration

### Phase 2

1. **Price History Service** — Track and compare prices
2. **Pantry Service** — Inventory and expiration tracking
3. **Analytics Service** — Spending reports and insights

### Phase 3

1. **AI Service** — Purchase predictions and suggestions
2. **Meal Plan Service** — Weekly planning and list generation
3. **Recipe Service** — Recipe management and import

---

## Related Documentation

- [Requirements](/docs/requirements.md) — Complete user stories
- [Service Layer Design](/docs/backend/services.md) — Service architecture
- [Business Rules](/docs/backend/business-rules.md) — Rule definitions
- [API Endpoints](/docs/api/endpoints.md) — REST API specification
