/**
 * Listly Database Seed Script
 * 
 * This script populates the database with:
 * - Reference data (categories, stores)
 * - Test user accounts
 * - Sample shopping lists and items
 * - Pantry items and recipes
 * - Edge case data for testing
 * 
 * Run: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (development only)
  await clearDatabase();

  // Seed in order of dependencies
  const users = await seedUsers();
  const categories = await seedCategories();
  const stores = await seedStores(categories);
  await seedUserPreferences(users);
  await seedShoppingLists(users, stores, categories);
  await seedPantryItems(users, categories);
  await seedRecipes(users);
  await seedMealPlans(users);
  await seedEdgeCases(users, categories);

  console.log('✅ Seed completed!');
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  // Delete in reverse order of dependencies
  await prisma.mealPlan.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.pantryItem.deleteMany();
  await prisma.itemHistory.deleteMany();
  await prisma.listItem.deleteMany();
  await prisma.listCollaborator.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.userFavoriteStore.deleteMany();
  await prisma.storeCategory.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');
}

async function seedUsers() {
  console.log('👤 Seeding users...');

  // Default password for all seed users: "password123"
  const passwordHash = await hash('password123', 12);

  const users = [
    {
      email: 'admin@listly.com',
      name: 'Admin User',
      passwordHash,
      provider: 'EMAIL' as const,
      emailVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
    {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash,
      provider: 'EMAIL' as const,
      emailVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
    {
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash,
      provider: 'EMAIL' as const,
      emailVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
    {
      email: 'demo@listly.com',
      name: 'Demo Account',
      passwordHash,
      provider: 'EMAIL' as const,
      emailVerified: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.create({ data: user });
    createdUsers.push(created);
  }

  console.log(`✓ Created ${users.length} users`);
  return createdUsers;
}

async function seedCategories() {
  console.log('📁 Seeding categories...');

  const categories = [
    {
      name: 'Produce',
      slug: 'produce',
      description: 'Fresh fruits and vegetables',
      icon: '🥬',
      color: '#22c55e',
      isDefault: true,
      sortOrder: 1,
    },
    {
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      description: 'Milk, cheese, yogurt, eggs',
      icon: '🥛',
      color: '#f0f9ff',
      isDefault: true,
      sortOrder: 2,
    },
    {
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      description: 'Fresh and frozen meats, fish',
      icon: '🥩',
      color: '#dc2626',
      isDefault: true,
      sortOrder: 3,
    },
    {
      name: 'Bakery',
      slug: 'bakery',
      description: 'Bread, pastries, baked goods',
      icon: '🍞',
      color: '#d97706',
      isDefault: true,
      sortOrder: 4,
    },
    {
      name: 'Pantry Staples',
      slug: 'pantry-staples',
      description: 'Canned goods, grains, pasta, rice',
      icon: '🏺',
      color: '#78716c',
      isDefault: true,
      sortOrder: 5,
    },
    {
      name: 'Frozen Foods',
      slug: 'frozen-foods',
      description: 'Frozen meals, vegetables, ice cream',
      icon: '🧊',
      color: '#60a5fa',
      isDefault: true,
      sortOrder: 6,
    },
    {
      name: 'Snacks & Candy',
      slug: 'snacks-candy',
      description: 'Chips, cookies, candy',
      icon: '🍪',
      color: '#f59e0b',
      isDefault: true,
      sortOrder: 7,
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Soft drinks, juice, coffee, tea',
      icon: '🥤',
      color: '#3b82f6',
      isDefault: true,
      sortOrder: 8,
    },
    {
      name: 'Health & Beauty',
      slug: 'health-beauty',
      description: 'Personal care, cosmetics',
      icon: '💄',
      color: '#ec4899',
      isDefault: true,
      sortOrder: 9,
    },
    {
      name: 'Household',
      slug: 'household',
      description: 'Cleaning supplies, paper products',
      icon: '🧹',
      color: '#8b5cf6',
      isDefault: true,
      sortOrder: 10,
    },
    {
      name: 'Baby & Kids',
      slug: 'baby-kids',
      description: 'Diapers, baby food, toys',
      icon: '👶',
      color: '#fbbf24',
      isDefault: true,
      sortOrder: 11,
    },
    {
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      description: 'Pet food, toys, accessories',
      icon: '🐾',
      color: '#a855f7',
      isDefault: true,
      sortOrder: 12,
    },
    {
      name: 'Other',
      slug: 'other',
      description: 'Miscellaneous items',
      icon: '📦',
      color: '#6b7280',
      isDefault: true,
      sortOrder: 99,
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories.push(created);
  }

  console.log(`✓ Created ${categories.length} categories`);
  return createdCategories;
}

async function seedStores(categories: any[]) {
  console.log('🏪 Seeding stores...');

  const stores = [
    {
      name: 'Whole Foods Market - Downtown',
      chain: 'Whole Foods',
      address: '123 Main St, San Francisco, CA 94102',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      name: 'Trader Joe\'s - Mission District',
      chain: 'Trader Joe\'s',
      address: '456 Valencia St, San Francisco, CA 94103',
      latitude: 37.7599,
      longitude: -122.4148,
    },
    {
      name: 'Safeway - Sunset',
      chain: 'Safeway',
      address: '789 Irving St, San Francisco, CA 94122',
      latitude: 37.7639,
      longitude: -122.4669,
    },
    {
      name: 'Costco Wholesale',
      chain: 'Costco',
      address: '450 10th St, San Francisco, CA 94103',
      latitude: 37.7726,
      longitude: -122.4099,
    },
  ];

  const createdStores = [];
  for (const store of stores) {
    const created = await prisma.store.create({ data: store });
    createdStores.push(created);

    // Create store-specific category mappings with aisle numbers
    // Only for Whole Foods as an example
    if (store.chain === 'Whole Foods') {
      const categoryMappings = [
        { categoryId: categories.find(c => c.slug === 'produce')?.id, aisleNumber: '1', sortOrder: 1 },
        { categoryId: categories.find(c => c.slug === 'bakery')?.id, aisleNumber: '2', sortOrder: 2 },
        { categoryId: categories.find(c => c.slug === 'meat-seafood')?.id, aisleNumber: '3', sortOrder: 3 },
        { categoryId: categories.find(c => c.slug === 'dairy-eggs')?.id, aisleNumber: '4', sortOrder: 4 },
        { categoryId: categories.find(c => c.slug === 'frozen-foods')?.id, aisleNumber: '5', sortOrder: 5 },
        { categoryId: categories.find(c => c.slug === 'pantry-staples')?.id, aisleNumber: '6-8', sortOrder: 6 },
        { categoryId: categories.find(c => c.slug === 'beverages')?.id, aisleNumber: '9', sortOrder: 7 },
        { categoryId: categories.find(c => c.slug === 'snacks-candy')?.id, aisleNumber: '10', sortOrder: 8 },
        { categoryId: categories.find(c => c.slug === 'household')?.id, aisleNumber: '11', sortOrder: 9 },
        { categoryId: categories.find(c => c.slug === 'health-beauty')?.id, aisleNumber: '12', sortOrder: 10 },
      ];

      for (const mapping of categoryMappings) {
        if (mapping.categoryId) {
          await prisma.storeCategory.create({
            data: {
              storeId: created.id,
              categoryId: mapping.categoryId,
              aisleNumber: mapping.aisleNumber,
              sortOrder: mapping.sortOrder,
            },
          });
        }
      }
    }
  }

  console.log(`✓ Created ${stores.length} stores`);
  return createdStores;
}

async function seedUserPreferences(users: any[]) {
  console.log('⚙️  Seeding user preferences...');

  for (const user of users) {
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        defaultBudgetWarning: 100.00,
        defaultCurrency: 'USD',
        notificationsEnabled: true,
        locationReminders: user.email === 'alice@example.com', // Only Alice has location reminders on
        theme: user.email === 'bob@example.com' ? 'dark' : 'system',
      },
    });
  }

  console.log(`✓ Created preferences for ${users.length} users`);
}

async function seedShoppingLists(users: any[], stores: any[], categories: any[]) {
  console.log('🛒 Seeding shopping lists...');

  const alice = users.find(u => u.email === 'alice@example.com');
  const bob = users.find(u => u.email === 'bob@example.com');
  const demo = users.find(u => u.email === 'demo@listly.com');

  // Alice's active grocery list
  const aliceGroceryList = await prisma.shoppingList.create({
    data: {
      name: 'Weekly Groceries',
      description: 'Regular weekly shopping',
      budget: 150.00,
      status: 'ACTIVE',
      color: '#3b82f6',
      icon: '🛒',
      ownerId: alice.id,
      storeId: stores[0].id, // Whole Foods
    },
  });

  // Add items to Alice's list
  const produceCategory = categories.find(c => c.slug === 'produce');
  const dairyCategory = categories.find(c => c.slug === 'dairy-eggs');
  const pantryCategory = categories.find(c => c.slug === 'pantry-staples');
  const meatCategory = categories.find(c => c.slug === 'meat-seafood');

  await prisma.listItem.createMany({
    data: [
      {
        name: 'Organic Bananas',
        quantity: 6,
        unit: 'pcs',
        estimatedPrice: 3.50,
        categoryId: produceCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 1,
        priority: 2,
      },
      {
        name: 'Whole Milk',
        quantity: 1,
        unit: 'gallon',
        estimatedPrice: 5.99,
        categoryId: dairyCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 2,
        isChecked: true,
        checkedAt: new Date(),
      },
      {
        name: 'Free Range Eggs',
        quantity: 1,
        unit: 'dozen',
        estimatedPrice: 6.99,
        categoryId: dairyCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 3,
      },
      {
        name: 'Chicken Breast',
        quantity: 2,
        unit: 'lbs',
        estimatedPrice: 12.98,
        categoryId: meatCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 4,
        priority: 3,
        notes: 'Boneless, skinless',
      },
      {
        name: 'Pasta',
        quantity: 2,
        unit: 'boxes',
        estimatedPrice: 4.50,
        categoryId: pantryCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 5,
      },
      {
        name: 'Marinara Sauce',
        quantity: 1,
        unit: 'jar',
        estimatedPrice: 3.99,
        categoryId: pantryCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 6,
      },
      {
        name: 'Fresh Spinach',
        quantity: 1,
        unit: 'bag',
        estimatedPrice: 4.29,
        categoryId: produceCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 7,
      },
      {
        name: 'Cherry Tomatoes',
        quantity: 1,
        unit: 'container',
        estimatedPrice: 3.99,
        categoryId: produceCategory?.id,
        listId: aliceGroceryList.id,
        addedById: alice.id,
        sortOrder: 8,
      },
    ],
  });

  // Bob's party list
  const bobPartyList = await prisma.shoppingList.create({
    data: {
      name: 'Weekend BBQ Party',
      description: 'Supplies for Saturday BBQ',
      budget: 200.00,
      status: 'ACTIVE',
      color: '#ef4444',
      icon: '🎉',
      ownerId: bob.id,
      storeId: stores[3].id, // Costco
    },
  });

  const beveragesCategory = categories.find(c => c.slug === 'beverages');
  const snacksCategory = categories.find(c => c.slug === 'snacks-candy');

  await prisma.listItem.createMany({
    data: [
      {
        name: 'Ground Beef',
        quantity: 5,
        unit: 'lbs',
        estimatedPrice: 24.95,
        categoryId: meatCategory?.id,
        listId: bobPartyList.id,
        addedById: bob.id,
        sortOrder: 1,
      },
      {
        name: 'Hamburger Buns',
        quantity: 2,
        unit: 'packs',
        estimatedPrice: 8.00,
        categoryId: categories.find(c => c.slug === 'bakery')?.id,
        listId: bobPartyList.id,
        addedById: bob.id,
        sortOrder: 2,
      },
      {
        name: 'Soda Variety Pack',
        quantity: 2,
        unit: 'cases',
        estimatedPrice: 20.00,
        categoryId: beveragesCategory?.id,
        listId: bobPartyList.id,
        addedById: bob.id,
        sortOrder: 3,
      },
      {
        name: 'Potato Chips',
        quantity: 3,
        unit: 'bags',
        estimatedPrice: 12.00,
        categoryId: snacksCategory?.id,
        listId: bobPartyList.id,
        addedById: bob.id,
        sortOrder: 4,
      },
    ],
  });

  // Shared list between Alice and Bob
  const sharedList = await prisma.shoppingList.create({
    data: {
      name: 'Household Essentials',
      description: 'Shared family supplies',
      status: 'ACTIVE',
      color: '#8b5cf6',
      icon: '🏠',
      ownerId: alice.id,
      storeId: stores[2].id, // Safeway
    },
  });

  // Add Bob as collaborator
  await prisma.listCollaborator.create({
    data: {
      listId: sharedList.id,
      userId: bob.id,
      role: 'EDITOR',
    },
  });

  const householdCategory = categories.find(c => c.slug === 'household');

  await prisma.listItem.createMany({
    data: [
      {
        name: 'Paper Towels',
        quantity: 2,
        unit: 'rolls',
        estimatedPrice: 8.99,
        categoryId: householdCategory?.id,
        listId: sharedList.id,
        addedById: alice.id,
        sortOrder: 1,
      },
      {
        name: 'Dish Soap',
        quantity: 1,
        unit: 'bottle',
        estimatedPrice: 3.49,
        categoryId: householdCategory?.id,
        listId: sharedList.id,
        addedById: bob.id,
        sortOrder: 2,
      },
      {
        name: 'Laundry Detergent',
        quantity: 1,
        unit: 'bottle',
        estimatedPrice: 12.99,
        categoryId: householdCategory?.id,
        listId: sharedList.id,
        addedById: alice.id,
        sortOrder: 3,
        isChecked: true,
        checkedAt: new Date(),
      },
    ],
  });

  // Demo completed list
  const completedList = await prisma.shoppingList.create({
    data: {
      name: 'Last Week Shopping',
      description: 'Completed grocery run',
      budget: 85.00,
      status: 'COMPLETED',
      color: '#22c55e',
      icon: '✅',
      ownerId: demo.id,
      storeId: stores[1].id, // Trader Joe's
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  });

  await prisma.listItem.createMany({
    data: [
      {
        name: 'Avocados',
        quantity: 4,
        unit: 'pcs',
        estimatedPrice: 5.00,
        categoryId: produceCategory?.id,
        listId: completedList.id,
        addedById: demo.id,
        isChecked: true,
        checkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        sortOrder: 1,
      },
      {
        name: 'Everything Bagels',
        quantity: 1,
        unit: 'pack',
        estimatedPrice: 3.99,
        categoryId: categories.find(c => c.slug === 'bakery')?.id,
        listId: completedList.id,
        addedById: demo.id,
        isChecked: true,
        checkedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        sortOrder: 2,
      },
    ],
  });

  // Template list
  await prisma.shoppingList.create({
    data: {
      name: 'Weekly Staples Template',
      description: 'Reusable template for regular shopping',
      isTemplate: true,
      color: '#f59e0b',
      icon: '📋',
      ownerId: alice.id,
    },
  });

  console.log('✓ Created shopping lists with items');
}

async function seedPantryItems(users: any[], categories: any[]) {
  console.log('🏺 Seeding pantry items...');

  const alice = users.find(u => u.email === 'alice@example.com');
  const bob = users.find(u => u.email === 'bob@example.com');

  const pantryCategory = categories.find(c => c.slug === 'pantry-staples');
  const produceCategory = categories.find(c => c.slug === 'produce');
  const dairyCategory = categories.find(c => c.slug === 'dairy-eggs');
  const frozenCategory = categories.find(c => c.slug === 'frozen-foods');

  await prisma.pantryItem.createMany({
    data: [
      // Alice's pantry
      {
        name: 'All-Purpose Flour',
        quantity: 2.5,
        unit: 'lbs',
        location: 'pantry',
        categoryId: pantryCategory?.id,
        userId: alice.id,
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        purchasePrice: 4.99,
      },
      {
        name: 'White Rice',
        quantity: 5,
        unit: 'lbs',
        location: 'pantry',
        categoryId: pantryCategory?.id,
        userId: alice.id,
        purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        purchasePrice: 8.99,
      },
      {
        name: 'Canned Tomatoes',
        quantity: 4,
        unit: 'cans',
        location: 'pantry',
        categoryId: pantryCategory?.id,
        userId: alice.id,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        purchasePrice: 6.00,
      },
      {
        name: 'Yogurt',
        quantity: 6,
        unit: 'cups',
        location: 'fridge',
        categoryId: dairyCategory?.id,
        userId: alice.id,
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        purchasePrice: 5.94,
      },
      {
        name: 'Frozen Peas',
        quantity: 2,
        unit: 'bags',
        location: 'freezer',
        categoryId: frozenCategory?.id,
        userId: alice.id,
        purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        purchasePrice: 4.00,
      },
      {
        name: 'Milk - Expiring Soon',
        quantity: 0.5,
        unit: 'gallon',
        location: 'fridge',
        categoryId: dairyCategory?.id,
        userId: alice.id,
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days - should trigger warning
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        purchasePrice: 5.99,
        notes: 'Use soon!',
      },
      // Bob's pantry
      {
        name: 'Coffee Beans',
        quantity: 1,
        unit: 'bag',
        location: 'pantry',
        categoryId: categories.find(c => c.slug === 'beverages')?.id,
        userId: bob.id,
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        purchasePrice: 12.99,
      },
      {
        name: 'Olive Oil',
        quantity: 1,
        unit: 'bottle',
        location: 'pantry',
        categoryId: pantryCategory?.id,
        userId: bob.id,
        purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        purchasePrice: 15.99,
      },
    ],
  });

  console.log('✓ Created pantry items');
}

async function seedRecipes(users: any[]) {
  console.log('📖 Seeding recipes...');

  const alice = users.find(u => u.email === 'alice@example.com');
  const demo = users.find(u => u.email === 'demo@listly.com');

  // Alice's pasta recipe
  const pastaRecipe = await prisma.recipe.create({
    data: {
      title: 'Simple Pasta with Marinara',
      description: 'Quick and easy weeknight pasta dinner',
      instructions: `1. Bring a large pot of salted water to boil.
2. Cook pasta according to package directions.
3. Meanwhile, heat marinara sauce in a pan.
4. Drain pasta and toss with sauce.
5. Serve with grated parmesan cheese.`,
      prepTime: 5,
      cookTime: 20,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Italian',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
      userId: alice.id,
      isPublic: false,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: pastaRecipe.id,
        name: 'Pasta',
        quantity: 1,
        unit: 'lb',
        sortOrder: 1,
      },
      {
        recipeId: pastaRecipe.id,
        name: 'Marinara Sauce',
        quantity: 24,
        unit: 'oz',
        sortOrder: 2,
      },
      {
        recipeId: pastaRecipe.id,
        name: 'Parmesan Cheese',
        quantity: 0.5,
        unit: 'cup',
        notes: 'Grated',
        sortOrder: 3,
      },
    ],
  });

  // Demo's chicken recipe
  const chickenRecipe = await prisma.recipe.create({
    data: {
      title: 'Baked Chicken Breast',
      description: 'Juicy baked chicken with herbs',
      instructions: `1. Preheat oven to 375°F.
2. Season chicken breasts with salt, pepper, and herbs.
3. Place in baking dish with a drizzle of olive oil.
4. Bake for 25-30 minutes until internal temp reaches 165°F.
5. Let rest 5 minutes before serving.`,
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'American',
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
      userId: demo.id,
      isPublic: true,
    },
  });

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: chickenRecipe.id,
        name: 'Chicken Breast',
        quantity: 4,
        unit: 'pieces',
        sortOrder: 1,
      },
      {
        recipeId: chickenRecipe.id,
        name: 'Olive Oil',
        quantity: 2,
        unit: 'tbsp',
        sortOrder: 2,
      },
      {
        recipeId: chickenRecipe.id,
        name: 'Mixed Herbs',
        quantity: 1,
        unit: 'tsp',
        notes: 'Dried',
        sortOrder: 3,
      },
    ],
  });

  console.log('✓ Created recipes');
  return [pastaRecipe, chickenRecipe];
}

async function seedMealPlans(users: any[]) {
  console.log('📅 Seeding meal plans...');

  const alice = users.find(u => u.email === 'alice@example.com');
  const recipes = await prisma.recipe.findMany();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.mealPlan.createMany({
    data: [
      {
        userId: alice.id,
        recipeId: recipes[0]?.id,
        mealType: 'DINNER',
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        notes: 'Weeknight dinner',
      },
      {
        userId: alice.id,
        recipeId: recipes[1]?.id,
        mealType: 'DINNER',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        userId: alice.id,
        mealType: 'LUNCH',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: 'Leftover pasta',
        isCompleted: false,
      },
    ],
  });

  console.log('✓ Created meal plans');
}

async function seedEdgeCases(users: any[], categories: any[]) {
  console.log('🔧 Seeding edge case data...');

  const demo = users.find(u => u.email === 'demo@listly.com');
  const otherCategory = categories.find(c => c.slug === 'other');

  // Edge case list
  const edgeList = await prisma.shoppingList.create({
    data: {
      name: 'Edge Cases Test List',
      description: 'List with edge case scenarios',
      status: 'ACTIVE',
      ownerId: demo.id,
    },
  });

  await prisma.listItem.createMany({
    data: [
      // Item with very long name
      {
        name: 'Super Long Item Name That Tests UI Overflow Behavior And Text Wrapping In Various Screen Sizes',
        quantity: 1,
        unit: 'pcs',
        categoryId: otherCategory?.id,
        listId: edgeList.id,
        addedById: demo.id,
        sortOrder: 1,
      },
      // Item with zero quantity
      {
        name: 'Zero Quantity Item',
        quantity: 0,
        unit: 'pcs',
        categoryId: otherCategory?.id,
        listId: edgeList.id,
        addedById: demo.id,
        sortOrder: 2,
      },
      // Item with very high price
      {
        name: 'Expensive Luxury Item',
        quantity: 1,
        unit: 'pcs',
        estimatedPrice: 9999.99,
        categoryId: otherCategory?.id,
        listId: edgeList.id,
        addedById: demo.id,
        sortOrder: 3,
      },
      // Item with fractional quantity
      {
        name: 'Fractional Quantity Item',
        quantity: 0.333,
        unit: 'kg',
        categoryId: otherCategory?.id,
        listId: edgeList.id,
        addedById: demo.id,
        sortOrder: 4,
      },
      // Item without category
      {
        name: 'Uncategorized Item',
        quantity: 1,
        unit: 'pcs',
        listId: edgeList.id,
        addedById: demo.id,
        sortOrder: 5,
      },
    ],
  });

  // Empty list
  await prisma.shoppingList.create({
    data: {
      name: 'Empty List',
      description: 'List with no items',
      status: 'ACTIVE',
      ownerId: demo.id,
    },
  });

  // Archived list
  await prisma.shoppingList.create({
    data: {
      name: 'Archived Old List',
      description: 'Old archived list',
      status: 'ARCHIVED',
      ownerId: demo.id,
      completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    },
  });

  console.log('✓ Created edge case data');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
