/**
 * useComingSoon Hook
 *
 * Shows a styled "Coming Soon" toast notification for placeholder features.
 * Uses the existing sonner toast system.
 *
 * @module hooks/useComingSoon
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

export function useComingSoon() {
  const showComingSoon = useCallback((featureName?: string) => {
    const message = featureName
      ? `${featureName} coming soon!`
      : 'This feature is coming soon!';

    toast(message, {
      description: "🚀 We're working on this. Stay tuned!",
      duration: 3000,
    });
  }, []);

  return { showComingSoon };
}
