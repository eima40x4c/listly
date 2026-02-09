# Seed Data Documentation

## Overview

Seed data provides consistent, realistic development and testing data for the Listly application. The seed script populates the database with reference data, test user accounts, sample shopping lists, pantry items, recipes, and edge cases for comprehensive testing.

---

## Running Seeds

### Seed the Database

```bash
# Run seed script
pnpm db:seed

# Or using Prisma directly
npx prisma db seed
```

### Reset and Re-seed

```bash
# Reset database and re-run all migrations, then seed
pnpm db:reset

# WARNING: This will delete all data!
```

---

## Test Accounts

All test accounts use the same password for development convenience.

| Email | Password | Purpose | Features Enabled |
|-------|----------|---------|------------------|
| admin@listly.com | password123 | Admin/development account | All features |
| alice@example.com | password123 | Primary test user | Active lists, collaboration, location reminders ON |
| bob@example.com | password123 | Secondary test user | Shared lists, dark theme |
| demo@listly.com | password123 | Demo/presentation account | Completed lists, templates |

**Security Note:** These are development-only credentials. Never use these in production!

---

## Data Quantities

| Entity | Count | Notes |
|--------|-------|-------|
| **Users** | 4 | Mix of active users with different preferences |
| **Categories** | 13 | Standard grocery categories (produce, dairy, etc.) |
| **Stores** | 4 | San Francisco area stores with real-ish coordinates |
| **Shopping Lists** | 6+ | Active, completed, archived, template, shared, empty |
| **List Items** | 30+ | Various states: checked, unchecked, with/without prices |
| **Pantry Items** | 8+ | Including items expiring soon for testing alerts |
| **Recipes** | 2 | Simple recipes with ingredients |
| **Meal Plans** | 3 | Upcoming meal plans for Alice |
| **Store Categories** | 10 | Aisle mappings for Whole Foods |
| **List Collaborators** | 1 | Bob as editor on Alice's shared list |

---

## Seeded Data Details

### Categories

13 default categories covering standard grocery shopping:

- 🥬 **Produce** - Fresh fruits and vegetables
- 🥛 **Dairy & Eggs** - Milk, cheese, yogurt, eggs
- 🥩 **Meat & Seafood** - Fresh and frozen meats, fish
- 🍞 **Bakery** - Bread, pastries, baked goods
- 🏺 **Pantry Staples** - Canned goods, grains, pasta, rice
- 🧊 **Frozen Foods** - Frozen meals, vegetables, ice cream
- 🍪 **Snacks & Candy** - Chips, cookies, candy
- 🥤 **Beverages** - Soft drinks, juice, coffee, tea
- 💄 **Health & Beauty** - Personal care, cosmetics
- 🧹 **Household** - Cleaning supplies, paper products
- 👶 **Baby & Kids** - Diapers, baby food, toys
- 🐾 **Pet Supplies** - Pet food, toys, accessories
- 📦 **Other** - Miscellaneous items

All categories include icons and color codes for UI consistency.

### Stores

Four test stores in the San Francisco area:

1. **Whole Foods Market - Downtown** (37.7749°N, 122.4194°W)
   - Has custom aisle mappings configured
   - Used for Alice's weekly grocery list

2. **Trader Joe's - Mission District** (37.7599°N, 122.4148°W)
   - Used for demo's completed list

3. **Safeway - Sunset** (37.7639°N, 122.4669°W)
   - Used for shared household list

4. **Costco Wholesale** (37.7726°N, 122.4099°W)
   - Used for Bob's party list

**Note:** Coordinates are approximate and for testing location-based features.

### Shopping Lists

1. **Alice - Weekly Groceries** (Active)
   - Budget: $150
   - Store: Whole Foods
   - Items: 8 (mix of produce, dairy, meat, pantry)
   - Status: Some items checked

2. **Bob - Weekend BBQ Party** (Active)
   - Budget: $200
   - Store: Costco
   - Items: 4 (party supplies, meat, snacks)
   - Status: All unchecked

3. **Alice & Bob - Household Essentials** (Active, Shared)
   - Store: Safeway
   - Items: 3 (cleaning supplies)
   - Bob is collaborator with EDITOR role
   - Status: 1 item checked

4. **Demo - Last Week Shopping** (Completed)
   - Store: Trader Joe's
   - Completed: 1 week ago
   - All items checked

5. **Alice - Weekly Staples Template** (Template)
   - Reusable template for regular shopping
   - No items (ready to be populated)

6. **Demo - Edge Cases Test List** (Active)
   - Contains edge case scenarios for testing
   - Long names, zero quantity, high prices, etc.

7. **Demo - Empty List** (Active)
   - No items for testing empty state

8. **Demo - Archived Old List** (Archived)
   - Completed 90 days ago

### Pantry Items

Sample pantry inventory for Alice and Bob:

**Alice's Pantry:**
- All-Purpose Flour (pantry location)
- White Rice (pantry)
- Canned Tomatoes (pantry, expires in 1 year)
- Yogurt (fridge, expires in 5 days)
- Frozen Peas (freezer)
- **Milk - Expiring Soon** (fridge, expires in 2 days) ⚠️ **Triggers expiration warning**

**Bob's Pantry:**
- Coffee Beans (pantry)
- Olive Oil (pantry)

### Recipes

1. **Simple Pasta with Marinara** (Alice)
   - Difficulty: Easy
   - Prep: 5 min, Cook: 20 min
   - Servings: 4
   - Ingredients: Pasta, marinara sauce, parmesan
   - Cuisine: Italian

2. **Baked Chicken Breast** (Demo)
   - Difficulty: Easy
   - Prep: 10 min, Cook: 30 min
   - Servings: 4
   - Ingredients: Chicken breast, olive oil, herbs
   - Cuisine: American
   - Public: Yes

### Meal Plans

Alice has 3 upcoming meals planned:

1. Tomorrow - Dinner: Simple Pasta with Marinara
2. In 2 days - Lunch: Leftover pasta (no recipe)
3. In 3 days - Dinner: Baked Chicken Breast

---

## Edge Cases

The seed script includes edge case data for comprehensive testing:

### Edge Case Items

Located in "Edge Cases Test List":

1. **Super Long Item Name** - Tests UI overflow and text wrapping
2. **Zero Quantity Item** - Tests handling of quantity = 0
3. **Expensive Luxury Item** - Price: $9,999.99 (tests high values)
4. **Fractional Quantity Item** - Quantity: 0.333 kg (tests decimals)
5. **Uncategorized Item** - No category assigned

### Edge Case Lists

- **Empty List** - Tests empty state UI
- **Archived List** - Completed 90 days ago for history testing

### Edge Case Pantry

- **Milk - Expiring Soon** - Expires in 2 days to trigger expiration alerts

---

## Customizing Seed Data

### Modify Existing Data

Edit [prisma/seed.ts](../../prisma/seed.ts) to adjust:

- User accounts
- Category names and colors
- Store locations
- Sample list items
- Recipe content

### Add More Data

1. **Add more users:**
   ```typescript
   // In seedUsers() function
   {
     email: 'newuser@example.com',
     name: 'New User',
     passwordHash,
     provider: 'EMAIL' as const,
     emailVerified: true,
   }
   ```

2. **Add more categories:**
   ```typescript
   // In seedCategories() function
   {
     name: 'New Category',
     slug: 'new-category',
     description: 'Description',
     icon: '📦',
     color: '#3b82f6',
     isDefault: true,
     sortOrder: 13,
   }
   ```

3. **Add more stores:**
   ```typescript
   // In seedStores() function
   {
     name: 'Store Name',
     chain: 'Chain Name',
     address: 'Address',
     latitude: 37.7749,
     longitude: -122.4194,
   }
   ```

### Using Reusable Constants

Shared constants are defined in [prisma/seed-data.ts](../../prisma/seed-data.ts):

```typescript
import { SEED_PASSWORD, TEST_USERS, CATEGORIES, STORES } from './seed-data';
```

Update this file to maintain consistency across seed functions.

---

## Development Workflow

### Initial Setup

```bash
# 1. Start database
pnpm docker:up

# 2. Run migrations
pnpm db:migrate

# 3. Seed data
pnpm db:seed

# 4. Open Prisma Studio to verify
pnpm db:studio
```

### When Schema Changes

```bash
# 1. Update prisma/schema.prisma
# 2. Create migration
pnpm db:migrate

# 3. Update seed script if needed
# 4. Re-seed
pnpm db:reset
```

### Quick Reset During Development

```bash
# Complete reset: drops DB, reruns migrations, seeds
pnpm db:reset

# Just re-seed (faster if schema hasn't changed)
pnpm db:seed
```

---

## Verification

After seeding, verify data using Prisma Studio:

```bash
pnpm db:studio
```

**Check for:**

- ✅ 4 users exist
- ✅ 13 categories with icons and colors
- ✅ 4 stores with coordinates
- ✅ Multiple shopping lists in different states
- ✅ List items with categories
- ✅ Pantry items with expiration dates
- ✅ Recipes with ingredients
- ✅ Meal plans scheduled
- ✅ Bob is collaborator on Alice's shared list

---

## Troubleshooting

### Seed Fails with Unique Constraint Error

**Cause:** Running seed multiple times without clearing.

**Solution:**
```bash
# Use db:reset to clear and re-seed
pnpm db:reset
```

### Cannot Connect to Database

**Cause:** PostgreSQL not running.

**Solution:**
```bash
# Start Docker services
pnpm docker:up

# Verify DATABASE_URL in .env
```

### TypeScript Errors in Seed Script

**Cause:** Missing dependencies or Prisma client not generated.

**Solution:**
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate
```

### Seed Runs But Data Missing

**Cause:** Seed script error that wasn't caught.

**Solution:**
- Check console output for warnings
- Run seed directly to see detailed errors:
  ```bash
  npx tsx prisma/seed.ts
  ```

---

## Related Documentation

- [Schema Design](./schema.md) - Database schema documentation
- [Database Selection](./database-decision.md) - Why PostgreSQL + Prisma
- [Development Setup](../development-setup.md) - Getting started guide
- [Prisma Documentation](https://www.prisma.io/docs) - Official Prisma docs

---

## Notes

- **Development Only:** This seed data is for local development and testing only
- **Not for Production:** Never run seeds against a production database
- **Password Security:** All test accounts use the same simple password
- **Data Realism:** Data is realistic enough for testing but not production-ready
- **Coordinates:** Store coordinates are approximate for feature testing only
