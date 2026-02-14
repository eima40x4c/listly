# API Endpoints

> **API Version:** 1.0.0
> **Base URL:** `http://localhost:3000/api/v1` (development)
> **Production:** `https://api.listly.app/v1`

---

## Overview

Listly's REST API follows standard conventions:

- **Authentication:** Bearer token (JWT) via `Authorization: Bearer <token>` header
- **Content-Type:** `application/json` for all requests/responses
- **Pagination:** `page` and `limit` query parameters
- **Filtering:** Resource-specific query parameters
- **Sorting:** `sort` and `order` parameters
- **Rate Limiting:** 1000 requests/hour (authenticated), 100 requests/hour (unauthenticated)

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* resource or array */
  },
  "meta": {
    /* pagination, etc. (optional) */
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      /* optional field-level errors */
    ]
  }
}
```

---

## Authentication

### POST /auth/register

Create a new user account.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "EMAIL",
    "emailVerified": false,
    "createdAt": "2026-02-09T12:00:00Z"
  }
}
```

---

### POST /auth/login

Authenticate and receive access token.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

### POST /auth/logout

Invalidate current session.

**Auth Required:** Yes

**Response:** `204 No Content`

---

### GET /auth/me

Get current authenticated user.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://...",
    "emailVerified": true
  }
}
```

---

### POST /auth/oauth/:provider

OAuth authentication (Google, Apple).

**Auth Required:** No

**Path Parameters:**

- `provider`: `google` | `apple`

**Request Body:**

```json
{
  "code": "oauth_authorization_code",
  "redirectUri": "https://listly.app/auth/callback"
}
```

**Response:** `200 OK` (same as `/auth/login`)

---

## Users

### GET /users/me

Get current user profile.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://...",
    "emailVerified": true,
    "createdAt": "2026-02-09T12:00:00Z",
    "preferences": {
      "defaultCurrency": "USD",
      "notificationsEnabled": true,
      "theme": "system"
    }
  }
}
```

---

### PATCH /users/me

Update current user profile.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Jane Doe",
  "avatarUrl": "https://new-avatar.com/image.jpg"
}
```

**Response:** `200 OK` (updated user object)

---

### DELETE /users/me

Delete current user account.

**Auth Required:** Yes

**Response:** `204 No Content`

---

### GET /users/me/preferences

Get user preferences.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "defaultBudgetWarning": 100.0,
    "defaultCurrency": "USD",
    "notificationsEnabled": true,
    "locationReminders": false,
    "theme": "dark"
  }
}
```

---

### PATCH /users/me/preferences

Update user preferences.

**Auth Required:** Yes

**Request Body:**

```json
{
  "theme": "dark",
  "notificationsEnabled": false,
  "defaultCurrency": "EUR"
}
```

**Response:** `200 OK` (updated preferences)

---

## Shopping Lists

### GET /lists

Get all lists for current user (owned + shared).

**Auth Required:** Yes

**Query Parameters:**

- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `status` (enum: `ACTIVE` | `COMPLETED` | `ARCHIVED`)
- `sort` (string, default: `updatedAt`)
- `order` (enum: `asc` | `desc`, default: `desc`)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "name": "Weekly Groceries",
      "description": "Costco run",
      "budget": 150.0,
      "status": "ACTIVE",
      "isTemplate": false,
      "color": "#4CAF50",
      "icon": "shopping-cart",
      "itemCount": 12,
      "completedCount": 5,
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-09T12:00:00Z",
      "owner": {
        "id": "clx9876543210",
        "name": "John Doe"
      },
      "store": {
        "id": "clxstore123",
        "name": "Costco",
        "chain": "Costco"
      },
      "role": "owner"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

### GET /lists/:id

Get a specific shopping list.

**Auth Required:** Yes

**Path Parameters:**

- `id` (string, required): List ID

**Query Parameters:**

- `include` (string, optional): Comma-separated relations (`items`, `collaborators`, `store`)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "Weekly Groceries",
    "description": "Costco run",
    "budget": 150.0,
    "status": "ACTIVE",
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-09T12:00:00Z",
    "items": [
      {
        "id": "clxitem123",
        "name": "Milk",
        "quantity": 2,
        "unit": "gallon",
        "isChecked": false,
        "estimatedPrice": 6.99,
        "category": {
          "id": "clxcat123",
          "name": "Dairy",
          "icon": "cheese"
        }
      }
    ],
    "collaborators": [
      {
        "id": "clxcollab123",
        "role": "EDITOR",
        "joinedAt": "2026-02-05T14:00:00Z",
        "user": {
          "id": "clxuser456",
          "name": "Jane Doe",
          "avatarUrl": "https://..."
        }
      }
    ],
    "store": {
      "id": "clxstore123",
      "name": "Costco",
      "address": "123 Main St"
    }
  }
}
```

---

### POST /lists

Create a new shopping list.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Weekly Groceries",
  "description": "Costco shopping trip",
  "budget": 150.0,
  "storeId": "clxstore123",
  "color": "#4CAF50",
  "icon": "shopping-cart",
  "isTemplate": false
}
```

**Response:** `201 Created` (list object)

---

### PATCH /lists/:id

Update a shopping list.

**Auth Required:** Yes (owner or admin collaborator only)

**Request Body:**

```json
{
  "name": "Updated List Name",
  "budget": 200.0,
  "status": "COMPLETED"
}
```

**Response:** `200 OK` (updated list object)

---

### DELETE /lists/:id

Delete a shopping list.

**Auth Required:** Yes (owner only)

**Response:** `204 No Content`

---

### POST /lists/:id/duplicate

Duplicate a shopping list.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Copy of Weekly Groceries",
  "includeCheckedItems": false
}
```

**Response:** `201 Created` (new list object)

---

## List Items

### GET /lists/:listId/items

Get all items in a list.

**Auth Required:** Yes

**Query Parameters:**

- `isChecked` (boolean, optional): Filter by checked status
- `categoryId` (string, optional): Filter by category
- `sort` (string, default: `sortOrder`)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxitem123",
      "name": "Milk",
      "quantity": 2,
      "unit": "gallon",
      "notes": "Get organic",
      "isChecked": false,
      "priority": 1,
      "estimatedPrice": 6.99,
      "sortOrder": 0,
      "category": {
        "id": "clxcat123",
        "name": "Dairy",
        "slug": "dairy"
      },
      "addedBy": {
        "id": "clxuser123",
        "name": "John Doe"
      },
      "createdAt": "2026-02-08T10:00:00Z"
    }
  ]
}
```

---

### POST /lists/:listId/items

Add item to shopping list.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Milk",
  "quantity": 2,
  "unit": "gallon",
  "notes": "Get organic",
  "categoryId": "clxcat123",
  "estimatedPrice": 6.99,
  "priority": 1
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "clxitem123",
      "name": "Milk",
      "quantity": 2,
      "unit": "gallon",
      "isChecked": false,
      "category": {
        /* ... */
      }
    },
    "suggestions": [
      {
        "name": "Bread",
        "reason": "Frequently bought together",
        "confidence": 0.85
      }
    ]
  }
}
```

---

### PATCH /lists/:listId/items/:itemId

Update list item.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Whole Milk",
  "quantity": 3,
  "isChecked": true,
  "notes": "Updated notes"
}
```

**Response:** `200 OK` (updated item)

---

### DELETE /lists/:listId/items/:itemId

Delete item from list.

**Auth Required:** Yes

**Response:** `204 No Content`

---

### PATCH /lists/:listId/items/:itemId/toggle

Toggle item checked status.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clxitem123",
    "isChecked": true,
    "checkedAt": "2026-02-09T14:30:00Z"
  }
}
```

---

### POST /lists/:listId/items/bulk

Bulk add items.

**Auth Required:** Yes

**Request Body:**

```json
{
  "items": [
    { "name": "Milk", "quantity": 2, "unit": "gallon" },
    { "name": "Bread", "quantity": 1, "unit": "loaf" },
    { "name": "Eggs", "quantity": 12, "unit": "count" }
  ]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "created": 3,
    "items": [
      /* array of created items */
    ]
  }
}
```

---

### POST /lists/:listId/items/reorder

Reorder items in list.

**Auth Required:** Yes

**Request Body:**

```json
{
  "itemOrders": [
    { "itemId": "clxitem123", "sortOrder": 0 },
    { "itemId": "clxitem456", "sortOrder": 1 },
    { "itemId": "clxitem789", "sortOrder": 2 }
  ]
}
```

**Response:** `200 OK`

---

## List Collaborators

### GET /lists/:listId/collaborators

Get all collaborators for a list.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxcollab123",
      "role": "EDITOR",
      "joinedAt": "2026-02-05T14:00:00Z",
      "user": {
        "id": "clxuser456",
        "email": "jane@example.com",
        "name": "Jane Doe",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

---

### POST /lists/:listId/collaborators

Invite collaborator to list.

**Auth Required:** Yes (owner or admin only)

**Request Body:**

```json
{
  "email": "friend@example.com",
  "role": "EDITOR"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "clxcollab789",
    "role": "EDITOR",
    "user": {
      "id": "clxuser999",
      "email": "friend@example.com",
      "name": "Friend Name"
    },
    "invitationSent": true
  }
}
```

---

### PATCH /lists/:listId/collaborators/:collaboratorId

Update collaborator role.

**Auth Required:** Yes (owner only)

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK` (updated collaborator)

---

### DELETE /lists/:listId/collaborators/:collaboratorId

Remove collaborator from list.

**Auth Required:** Yes (owner or self)

**Response:** `204 No Content`

---

## Categories

### GET /categories

Get all item categories.

**Auth Required:** No (public data)

**Query Parameters:**

- `isDefault` (boolean, optional): Filter system vs custom categories

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxcat123",
      "name": "Dairy",
      "slug": "dairy",
      "description": "Milk, cheese, yogurt, etc.",
      "icon": "cheese",
      "color": "#FFEB3B",
      "isDefault": true,
      "sortOrder": 0
    }
  ]
}
```

---

### GET /categories/:id

Get category by ID.

**Auth Required:** No

**Response:** `200 OK` (category object)

---

### POST /categories

Create custom category.

**Auth Required:** Yes (admin only)

**Request Body:**

```json
{
  "name": "Snacks",
  "slug": "snacks",
  "description": "Chips, cookies, etc.",
  "icon": "cookie",
  "color": "#FF9800"
}
```

**Response:** `201 Created` (category object)

---

## Stores

### GET /stores

Search for stores.

**Auth Required:** No

**Query Parameters:**

- `q` (string, optional): Search query
- `latitude` (decimal, optional): User location latitude
- `longitude` (decimal, optional): User location longitude
- `radius` (decimal, optional): Search radius in km (default: 10)
- `chain` (string, optional): Filter by chain name
- `page`, `limit`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxstore123",
      "name": "Costco",
      "chain": "Costco",
      "address": "123 Main St, City, State 12345",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "distance": 2.5
    }
  ],
  "meta": {
    /* pagination */
  }
}
```

---

### GET /stores/:id

Get store details.

**Auth Required:** No

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clxstore123",
    "name": "Costco",
    "chain": "Costco",
    "address": "123 Main St, City, State 12345",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "categories": [
      {
        "id": "clxstorecat123",
        "category": {
          "id": "clxcat123",
          "name": "Dairy"
        },
        "aisleNumber": "A5",
        "sortOrder": 0
      }
    ]
  }
}
```

---

### POST /users/me/stores/favorites

Add store to favorites.

**Auth Required:** Yes

**Request Body:**

```json
{
  "storeId": "clxstore123"
}
```

**Response:** `201 Created`

---

### DELETE /users/me/stores/favorites/:storeId

Remove store from favorites.

**Auth Required:** Yes

**Response:** `204 No Content`

---

### GET /users/me/stores/favorites

Get user's favorite stores.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxstore123",
      "name": "Costco",
      "chain": "Costco",
      "address": "123 Main St"
    }
  ]
}
```

---

## Pantry

### GET /pantry

Get user's pantry inventory.

**Auth Required:** Yes

**Query Parameters:**

- `location` (string, optional): Filter by location (fridge, freezer, pantry, cabinet)
- `categoryId` (string, optional): Filter by category
- `expiringWithin` (integer, optional): Days until expiration
- `isConsumed` (boolean, default: false): Include consumed items
- `page`, `limit`, `sort`, `order`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxpantry123",
      "name": "Milk",
      "quantity": 1,
      "unit": "gallon",
      "location": "fridge",
      "barcode": "012345678901",
      "expirationDate": "2026-02-15",
      "purchaseDate": "2026-02-08",
      "purchasePrice": 6.99,
      "isConsumed": false,
      "category": {
        "id": "clxcat123",
        "name": "Dairy"
      },
      "daysUntilExpiration": 6,
      "createdAt": "2026-02-08T10:00:00Z"
    }
  ],
  "meta": {
    /* pagination */
  }
}
```

---

### POST /pantry

Add item to pantry.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Milk",
  "quantity": 1,
  "unit": "gallon",
  "location": "fridge",
  "barcode": "012345678901",
  "expirationDate": "2026-02-15",
  "purchaseDate": "2026-02-08",
  "purchasePrice": 6.99,
  "categoryId": "clxcat123"
}
```

**Response:** `201 Created` (pantry item)

---

### PATCH /pantry/:id

Update pantry item.

**Auth Required:** Yes

**Request Body:**

```json
{
  "quantity": 0.5,
  "notes": "Half consumed"
}
```

**Response:** `200 OK` (updated item)

---

### DELETE /pantry/:id

Remove item from pantry.

**Auth Required:** Yes

**Response:** `204 No Content`

---

### PATCH /pantry/:id/consume

Mark pantry item as consumed.

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clxpantry123",
    "isConsumed": true
  }
}
```

---

### GET /pantry/expiring

Get items expiring soon.

**Auth Required:** Yes

**Query Parameters:**

- `days` (integer, default: 7): Look ahead days

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxpantry123",
      "name": "Milk",
      "expirationDate": "2026-02-15",
      "daysUntilExpiration": 6,
      "location": "fridge"
    }
  ]
}
```

---

## Recipes

### GET /recipes

Get user's recipes.

**Auth Required:** Yes

**Query Parameters:**

- `q` (string, optional): Search query
- `cuisine` (string, optional): Filter by cuisine
- `difficulty` (string, optional): easy | medium | hard
- `prepTime` (integer, optional): Max prep time in minutes
- `isPublic` (boolean, optional): Filter public recipes
- `page`, `limit`, `sort`, `order`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxrecipe123",
      "title": "Spaghetti Carbonara",
      "description": "Classic Italian pasta dish",
      "prepTime": 10,
      "cookTime": 20,
      "servings": 4,
      "difficulty": "medium",
      "cuisine": "Italian",
      "imageUrl": "https://...",
      "ingredientCount": 6,
      "createdAt": "2026-02-01T10:00:00Z"
    }
  ],
  "meta": {
    /* pagination */
  }
}
```

---

### GET /recipes/:id

Get recipe details.

**Auth Required:** Yes (owner or public recipe)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clxrecipe123",
    "title": "Spaghetti Carbonara",
    "description": "Classic Italian pasta dish",
    "instructions": "1. Boil water...\n2. Cook pasta...",
    "prepTime": 10,
    "cookTime": 20,
    "servings": 4,
    "difficulty": "medium",
    "cuisine": "Italian",
    "imageUrl": "https://...",
    "sourceUrl": "https://original-recipe.com",
    "ingredients": [
      {
        "id": "clxingredient123",
        "name": "Spaghetti",
        "quantity": 400,
        "unit": "g",
        "notes": "Dry pasta",
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

---

### POST /recipes

Create recipe.

**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "instructions": "1. Boil water...\n2. Cook pasta...",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "Italian",
  "imageUrl": "https://...",
  "ingredients": [
    {
      "name": "Spaghetti",
      "quantity": 400,
      "unit": "g"
    }
  ]
}
```

**Response:** `201 Created` (recipe object)

---

### POST /recipes/import

Import recipe from URL.

**Auth Required:** Yes

**Request Body:**

```json
{
  "url": "https://example-recipe.com/carbonara"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "clxrecipe456",
    "title": "Extracted Recipe Title",
    "ingredients": [
      /* extracted */
    ],
    "instructions": "Extracted instructions..."
  }
}
```

---

### PATCH /recipes/:id

Update recipe.

**Auth Required:** Yes (owner only)

**Request Body:** (partial update)

**Response:** `200 OK` (updated recipe)

---

### DELETE /recipes/:id

Delete recipe.

**Auth Required:** Yes (owner only)

**Response:** `204 No Content`

---

## Meal Plans

### GET /meal-plans

Get user's meal plans.

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (ISO date, required): Start of date range
- `endDate` (ISO date, required): End of date range
- `mealType` (enum, optional): BREAKFAST | LUNCH | DINNER | SNACK

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxmeal123",
      "mealType": "DINNER",
      "date": "2026-02-10T00:00:00Z",
      "notes": "Family dinner",
      "isCompleted": false,
      "recipe": {
        "id": "clxrecipe123",
        "title": "Spaghetti Carbonara",
        "prepTime": 10,
        "cookTime": 20
      },
      "createdAt": "2026-02-09T10:00:00Z"
    }
  ]
}
```

---

### POST /meal-plans

Create meal plan entry.

**Auth Required:** Yes

**Request Body:**

```json
{
  "mealType": "DINNER",
  "date": "2026-02-10",
  "recipeId": "clxrecipe123",
  "notes": "Family dinner"
}
```

**Response:** `201 Created` (meal plan object)

---

### PATCH /meal-plans/:id

Update meal plan.

**Auth Required:** Yes

**Request Body:**

```json
{
  "isCompleted": true,
  "notes": "Was delicious!"
}
```

**Response:** `200 OK` (updated meal plan)

---

### DELETE /meal-plans/:id

Delete meal plan entry.

**Auth Required:** Yes

**Response:** `204 No Content`

---

### POST /meal-plans/generate-list

Generate shopping list from meal plan.

**Auth Required:** Yes

**Request Body:**

```json
{
  "startDate": "2026-02-10",
  "endDate": "2026-02-16",
  "listName": "Weekly Meal Prep",
  "excludePantryItems": true
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "listId": "clxlist789",
    "itemsAdded": 23,
    "itemsSkipped": 5,
    "list": {
      "id": "clxlist789",
      "name": "Weekly Meal Prep",
      "itemCount": 23
    }
  }
}
```

---

## Item History

### GET /history/items

Get user's item purchase history.

**Auth Required:** Yes

**Query Parameters:**

- `itemName` (string, optional): Filter by item name
- `storeId` (string, optional): Filter by store
- `action` (enum, optional): ADDED | CHECKED | PRICE_UPDATED
- `startDate` (ISO date, optional): Filter from date
- `endDate` (ISO date, optional): Filter to date
- `page`, `limit`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxhistory123",
      "itemName": "Milk",
      "quantity": 2,
      "unit": "gallon",
      "price": 6.99,
      "action": "CHECKED",
      "store": {
        "id": "clxstore123",
        "name": "Costco"
      },
      "createdAt": "2026-02-08T14:30:00Z"
    }
  ],
  "meta": {
    /* pagination */
  }
}
```

---

### GET /history/items/:itemName/prices

Get price history for a specific item.

**Auth Required:** Yes

**Query Parameters:**

- `storeId` (string, optional): Filter by store
- `limit` (integer, default: 50): Number of records

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "itemName": "Milk",
    "priceHistory": [
      {
        "price": 6.99,
        "store": {
          "id": "clxstore123",
          "name": "Costco"
        },
        "createdAt": "2026-02-08T14:30:00Z"
      }
    ],
    "statistics": {
      "averagePrice": 6.85,
      "minPrice": 6.49,
      "maxPrice": 7.29,
      "lastPrice": 6.99
    }
  }
}
```

---

### GET /history/spending

Get spending analytics.

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (ISO date, required)
- `endDate` (ISO date, required)
- `groupBy` (enum, optional): day | week | month | category | store

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalSpent": 523.45,
    "breakdown": [
      {
        "date": "2026-02-01",
        "amount": 123.45,
        "itemCount": 15
      }
    ],
    "byCategory": [
      {
        "category": "Dairy",
        "amount": 85.32,
        "percentage": 16.3
      }
    ],
    "byStore": [
      {
        "store": "Costco",
        "amount": 325.0,
        "tripCount": 3
      }
    ]
  }
}
```

---

## AI Suggestions (Phase 3)

### POST /ai/suggestions/items

Get AI-powered item suggestions.

**Auth Required:** Yes

**Request Body:**

```json
{
  "listId": "clxlist123",
  "context": "weekly-shopping"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "name": "Milk",
        "reason": "You buy this every week",
        "confidence": 0.92,
        "lastPurchased": "2026-02-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /ai/categorize

Auto-categorize an item.

**Auth Required:** Yes

**Request Body:**

```json
{
  "itemName": "organic whole milk"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "category": {
      "id": "clxcat123",
      "name": "Dairy",
      "slug": "dairy"
    },
    "confidence": 0.95
  }
}
```

---

## System

### GET /health

Health check endpoint.

**Auth Required:** No

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "up",
    "cache": "up"
  }
}
```

---

## Common Query Parameters

| Parameter | Type    | Default | Description                          |
| --------- | ------- | ------- | ------------------------------------ |
| `page`    | integer | 1       | Page number for pagination           |
| `limit`   | integer | 20      | Items per page (max: 100)            |
| `sort`    | string  | varies  | Field to sort by                     |
| `order`   | enum    | desc    | Sort order: `asc` or `desc`          |
| `q`       | string  | -       | Search query                         |
| `include` | string  | -       | Comma-separated relations to include |

---

## HTTP Status Codes

| Code  | Meaning               | Use Case                       |
| ----- | --------------------- | ------------------------------ |
| `200` | OK                    | Successful GET, PUT, PATCH     |
| `201` | Created               | Successful POST                |
| `204` | No Content            | Successful DELETE              |
| `400` | Bad Request           | Validation error               |
| `401` | Unauthorized          | Missing/invalid authentication |
| `403` | Forbidden             | Insufficient permissions       |
| `404` | Not Found             | Resource doesn't exist         |
| `409` | Conflict              | Duplicate/constraint violation |
| `422` | Unprocessable Entity  | Business logic error           |
| `429` | Too Many Requests     | Rate limit exceeded            |
| `500` | Internal Server Error | Unexpected server error        |

---

## Rate Limiting

**Limits:**

- Authenticated: 1000 requests/hour
- Unauthenticated: 100 requests/hour

**Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1675934400
```

**Rate Limit Exceeded Response:** `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 3600
  }
}
```

---

---

## Pantry

### GET /pantry

Get pantry items for current user.

**Auth Required:** Yes

**Query Parameters:**

- `page` (integer, default: 1)
- `limit` (integer, default: 50)
- `location` (string, optional): Filter by location (e.g., "pantry", "fridge")
- `isConsumed` (boolean, optional): Filter by consumed status
- `query` (string, optional): Search by name

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxpantry123",
      "name": "Flour",
      "quantity": 1,
      "unit": "kg",
      "location": "pantry",
      "expirationDate": "2026-12-31T00:00:00Z",
      "isConsumed": false,
      "category": {
        "id": "clxcat123",
        "name": "Baking",
        "icon": "bread-slice"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### POST /pantry

Add item to pantry.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Milk",
  "quantity": 1,
  "unit": "carton",
  "location": "fridge",
  "expirationDate": "2026-02-20T00:00:00Z",
  "categoryId": "clxcat456"
}
```

**Response:** `201 Created`

---

### GET /pantry/:id

Get a specific pantry item.

**Auth Required:** Yes

**Response:** `200 OK`

---

### PATCH /pantry/:id

Update a pantry item.

**Auth Required:** Yes

**Request Body:**

```json
{
  "quantity": 0.5,
  "isConsumed": false
}
```

**Response:** `200 OK`

---

### DELETE /pantry/:id

Delete a pantry item.

**Auth Required:** Yes

**Response:** `204 No Content`

---

## Recipes

### GET /recipes

Get recipes for current user.

**Auth Required:** Yes

**Query Parameters:**

- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `query` (string, optional): Search by title
- `cuisine` (string, optional): Filter by cuisine
- `difficulty` (string, optional): Filter by difficulty

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxrecipe123",
      "title": "Pancakes",
      "description": "Fluffy pancakes",
      "prepTime": 10,
      "cookTime": 15,
      "difficulty": "easy",
      "isPublic": false,
      "createdAt": "2026-02-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### POST /recipes

Create a new recipe.

**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Pancakes",
  "instructions": "Mix ingredients and cook on griddle.",
  "ingredients": [
    { "name": "Flour", "quantity": 2, "unit": "cup" },
    { "name": "Milk", "quantity": 1.5, "unit": "cup" },
    { "name": "Egg", "quantity": 2, "unit": "count" }
  ],
  "prepTime": 10,
  "cookTime": 15,
  "servings": 4,
  "difficulty": "easy"
}
```

**Response:** `201 Created`

---

### GET /recipes/:id

Get a specific recipe with details.

**Auth Required:** Yes

**Response:** `200 OK`

---

### PATCH /recipes/:id

Update a recipe.

**Auth Required:** Yes

**Request Body:**

```json
{
  "title": "Blueberry Pancakes",
  "description": "Now with blueberries!"
}
```

**Response:** `200 OK`

---

### DELETE /recipes/:id

Delete a recipe.

**Auth Required:** Yes

**Response:** `204 No Content`

---

## Meal Plans

### GET /meal-plans

Get meal plans for current user.

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (ISO8601 Date, optional): Filter start date
- `endDate` (ISO8601 Date, optional): Filter end date
- `mealType` (string, optional): Filter by meal type

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxplan123",
      "date": "2026-02-15T00:00:00Z",
      "mealType": "BREAKFAST",
      "recipe": {
        "id": "clxrecipe123",
        "title": "Pancakes"
      },
      "isCompleted": false
    }
  ]
}
```

---

### POST /meal-plans

Create a new meal plan.

**Auth Required:** Yes

**Request Body:**

```json
{
  "date": "2026-02-15T00:00:00Z",
  "mealType": "BREAKFAST",
  "recipeId": "clxrecipe123",
  "notes": "Sunday brunch"
}
```

**Response:** `201 Created`

---

### GET /meal-plans/:id

Get a specific meal plan.

**Auth Required:** Yes

**Response:** `200 OK`

---

### PATCH /meal-plans/:id

Update a meal plan.

**Auth Required:** Yes

**Request Body:**

```json
{
  "isCompleted": true,
  "notes": "Enjoyed it!"
}
```

**Response:** `200 OK`

---

### DELETE /meal-plans/:id

Delete a meal plan.

**Auth Required:** Yes

**Response:** `204 No Content`

---

## Versioning

**Current Version:** v1

**URL Format:** `/api/v1/...`

When breaking changes are introduced, a new version will be created (`/api/v2/...`). Previous versions will be supported for at least 6 months after deprecation notice.

---

## WebSocket / Real-Time (Future)

Real-time collaboration will use WebSocket connections:

**Connection:** `wss://api.listly.app/ws`

**Authentication:** Send JWT token in first message

**Events:**

- `list:item:added` - New item added to list
- `list:item:updated` - Item updated
- `list:item:checked` - Item checked/unchecked
- `list:collaborator:joined` - New collaborator joined
- `list:updated` - List metadata updated

_(Full spec in Phase 2)_

---

## Document History

| Version | Date       | Author   | Changes                        |
| ------- | ---------- | -------- | ------------------------------ |
| 1.0     | 2026-02-09 | AI Agent | Initial API design for SOP-200 |
