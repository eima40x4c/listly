/**
 * Seed Data Constants
 * 
 * Reusable constants for database seeding.
 * Extracted for maintainability and consistency.
 */

export const SEED_PASSWORD = 'password123';

export const TEST_USERS = [
  {
    email: 'admin@listly.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    email: 'alice@example.com',
    name: 'Alice Johnson',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  },
  {
    email: 'bob@example.com',
    name: 'Bob Smith',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  },
  {
    email: 'demo@listly.com',
    name: 'Demo Account',
    role: 'demo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  },
] as const;

export const CATEGORIES = [
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
] as const;

export const STORES = [
  {
    name: 'Whole Foods Market - Downtown',
    chain: 'Whole Foods',
    address: '123 Main St, San Francisco, CA 94102',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    name: "Trader Joe's - Mission District",
    chain: "Trader Joe's",
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
] as const;
