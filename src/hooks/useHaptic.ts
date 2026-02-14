/**
 * useHaptic Hook
 *
 * Wraps navigator.vibrate() with feature detection.
 * Reads hapticEnabled from useSettingsStore.
 * Mobile-only; no-op on desktop.
 *
 * @module hooks/useHaptic
 */

import { useCallback } from 'react';

import { useSettingsStore } from '@/stores/useSettingsStore';

type VibrationPattern = number | number[];

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

function vibrate(pattern: VibrationPattern): void {
  if (canVibrate()) {
    navigator.vibrate(pattern);
  }
}

export function useHaptic() {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  /** Light tap — e.g. button press, item toggle (10ms) */
  const lightTap = useCallback(() => {
    if (hapticEnabled) vibrate(10);
  }, [hapticEnabled]);

  /** Medium tap — e.g. checkbox check, navigation (25ms) */
  const mediumTap = useCallback(() => {
    if (hapticEnabled) vibrate(25);
  }, [hapticEnabled]);

  /** Heavy tap — e.g. delete action, error (50ms) */
  const heavyTap = useCallback(() => {
    if (hapticEnabled) vibrate(50);
  }, [hapticEnabled]);

  /** Selection tap — e.g. dropdown select, picker (15ms) */
  const selectionTap = useCallback(() => {
    if (hapticEnabled) vibrate(15);
  }, [hapticEnabled]);

  /** Notification tap — double pulse for success/notification */
  const notificationTap = useCallback(() => {
    if (hapticEnabled) vibrate([30, 50, 30]);
  }, [hapticEnabled]);

  return { lightTap, mediumTap, heavyTap, selectionTap, notificationTap };
}
