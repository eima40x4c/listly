/**
 * Settings Store
 *
 * Persisted user preferences using Zustand with localStorage.
 * Manages currency, notification preferences, view modes, haptic feedback,
 * and onboarding state.
 *
 * @module stores/useSettingsStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'grid' | 'list';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'EGP';

interface SettingsState {
  /** Default currency for budget/price displays */
  currency: Currency;
  /** Preferred view mode for recipe collections */
  viewMode: ViewMode;
  /** Whether push notifications are enabled */
  notificationsEnabled: boolean;
  /** Whether location services are enabled */
  locationEnabled: boolean;
  /** Default store name */
  defaultStore: string;
  /** Whether haptic feedback is enabled (mobile) */
  hapticEnabled: boolean;
  /** Whether the user has completed onboarding */
  hasCompletedOnboarding: boolean;

  // Actions
  setCurrency: (currency: Currency) => void;
  setViewMode: (mode: ViewMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLocationEnabled: (enabled: boolean) => void;
  setDefaultStore: (store: string) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      viewMode: 'grid',
      notificationsEnabled: true,
      locationEnabled: false,
      defaultStore: '',
      hapticEnabled: true,
      hasCompletedOnboarding: false,

      setCurrency: (currency) => set({ currency }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
      setLocationEnabled: (enabled) => set({ locationEnabled: enabled }),
      setDefaultStore: (store) => set({ defaultStore: store }),
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),
    }),
    {
      name: 'listly-settings',
    }
  )
);
