/**
 * App Store
 *
 * Global UI state management using Zustand.
 * Manages sidebar, navigation, and mobile menu state.
 *
 * @module stores/useAppStore
 */

import { create } from 'zustand';

export type NavItem =
  | 'lists'
  | 'pantry'
  | 'meals'
  | 'budget'
  | 'settings'
  | 'recipes';

interface AppState {
  /** Whether sidebar is collapsed (desktop) */
  sidebarCollapsed: boolean;
  /** Whether mobile menu is open */
  mobileMenuOpen: boolean;
  /** Currently active navigation item */
  activeNav: NavItem;
  /** Whether the app shell has been mounted */
  mounted: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActiveNav: (nav: NavItem) => void;
  setMounted: (mounted: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  activeNav: 'lists',
  mounted: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setActiveNav: (nav) => set({ activeNav: nav }),
  setMounted: (mounted) => set({ mounted }),
}));
