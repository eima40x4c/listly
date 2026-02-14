/**
 * usePantryCheck Hook
 *
 * Checks which ingredients are available in the user's pantry.
 * Used by Recipe Detail and Generate Shopping List flows.
 *
 * @module hooks/usePantryCheck
 */

import { useMemo } from 'react';

interface PantryCheckResult {
  name: string;
  inPantry: boolean;
  quantity?: string;
}

/**
 * Check which ingredients are available in the pantry.
 *
 * NOTE: This is currently a placeholder that always returns inPantry: false.
 * It will be connected to the Pantry API once the backend is ready.
 */
export function usePantryCheck(ingredients: string[]): PantryCheckResult[] {
  // TODO: Replace with actual API call to check pantry items
  const results = useMemo(() => {
    return ingredients.map((name) => ({
      name,
      inPantry: false,
      quantity: undefined,
    }));
  }, [ingredients]);

  return results;
}
