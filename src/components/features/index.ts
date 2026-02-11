/**
 * Feature Components Barrel Export
 *
 * Central export for all feature-specific components.
 * Feature components will be organized by domain (e.g., shopping-lists, pantry, etc.)
 *
 * @example
 * ```tsx
 * import { LoginForm, ShoppingListForm } from '@/components/features';
 * ```
 */

// Auth components
export { LoginForm, type LoginFormProps } from './auth/LoginForm';
export { RegisterForm, type RegisterFormProps } from './auth/RegisterForm';

// Shopping list components
export { ListItemForm, type ListItemFormProps } from './lists/ListItemForm';
export {
  ShoppingListForm,
  type ShoppingListFormProps,
} from './lists/ShoppingListForm';
