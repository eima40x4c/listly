/**
 * Service Factory
 *
 * Provides singleton instances of services with dependency injection.
 * Uses a simple factory pattern for service instantiation.
 *
 * @module services
 */

import { CategoryService } from './category.service';
import { CollaborationService } from './collaboration.service';
import { ItemService } from './item.service';
import { ListService } from './list.service';
import { MealPlanService } from './meal-plan.service';
import { PantryService } from './pantry.service';
import { RecipeService } from './recipe.service';
import { StoreService } from './store.service';
import { UserService } from './user.service';

// Service instances (singletons)
let listService: ListService | null = null;
let itemService: ItemService | null = null;
let categoryService: CategoryService | null = null;
let userService: UserService | null = null;
let collaborationService: CollaborationService | null = null;
let mealPlanService: MealPlanService | null = null;
let pantryService: PantryService | null = null;
let recipeService: RecipeService | null = null;
let storeService: StoreService | null = null;

/**
 * Get ListService instance
 */
export function getListService(): ListService {
  if (!listService) {
    listService = new ListService();
  }
  return listService;
}

/**
 * Get ItemService instance
 */
export function getItemService(): ItemService {
  if (!itemService) {
    itemService = new ItemService();
  }
  return itemService;
}

/**
 * Get CategoryService instance
 */
export function getCategoryService(): CategoryService {
  if (!categoryService) {
    categoryService = new CategoryService();
  }
  return categoryService;
}

/**
 * Get UserService instance
 */
export function getUserService(): UserService {
  if (!userService) {
    userService = new UserService();
  }
  return userService;
}

/**
 * Get CollaborationService instance
 */
export function getCollaborationService(): CollaborationService {
  if (!collaborationService) {
    collaborationService = new CollaborationService();
  }
  return collaborationService;
}

/**
 * Get MealPlanService instance
 */
export function getMealPlanService(): MealPlanService {
  if (!mealPlanService) {
    mealPlanService = new MealPlanService();
  }
  return mealPlanService;
}

/**
 * Get PantryService instance
 */
export function getPantryService(): PantryService {
  if (!pantryService) {
    pantryService = new PantryService();
  }
  return pantryService;
}

/**
 * Get RecipeService instance
 */
export function getRecipeService(): RecipeService {
  if (!recipeService) {
    recipeService = new RecipeService();
  }
  return recipeService;
}

/**
 * Get StoreService instance
 */
export function getStoreService(): StoreService {
  if (!storeService) {
    storeService = new StoreService();
  }
  return storeService;
}

/**
 * Reset all service instances (useful for testing)
 */
export function resetServices(): void {
  listService = null;
  itemService = null;
  categoryService = null;
  userService = null;
  collaborationService = null;
  mealPlanService = null;
  pantryService = null;
  recipeService = null;
  storeService = null;
}

// Export service classes for direct instantiation if needed
export { CategoryService } from './category.service';
export { CollaborationService } from './collaboration.service';
export { ItemService } from './item.service';
export { ListService } from './list.service';
export { MealPlanService } from './meal-plan.service';
export { PantryService } from './pantry.service';
export { RecipeService } from './recipe.service';
export { StoreService } from './store.service';
export { UserService } from './user.service';

// Export interfaces
export * from './interfaces';
