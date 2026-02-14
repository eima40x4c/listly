/**
 * OnboardingGate Component
 *
 * Client wrapper that shows the OnboardingFlow overlay on first login
 * if the user hasn't completed onboarding yet.
 * Reads `hasCompletedOnboarding` from the settings store (persisted in localStorage).
 *
 * @module components/features/onboarding/OnboardingGate
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { useSettingsStore } from '@/stores/useSettingsStore';

import { OnboardingFlow } from './OnboardingFlow';

export function OnboardingGate() {
  const { data: session } = useSession();
  const hasCompletedOnboarding = useSettingsStore(
    (s) => s.hasCompletedOnboarding
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until hydrated (avoids SSR mismatch with localStorage)
  if (!mounted) return null;

  // Already completed or not logged in → nothing to show
  if (hasCompletedOnboarding || !session?.user) return null;

  return <OnboardingFlow userName={session.user.name} />;
}
