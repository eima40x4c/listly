/**
 * AppShell Component
 *
 * Wraps authenticated pages with consistent layout:
 * Header + Sidebar (desktop) + BottomNavigation (mobile) + main content area.
 * Also renders OnboardingGate for first-time users.
 *
 * @module components/layout/AppShell
 */

'use client';

import { useSession } from 'next-auth/react';

import { OnboardingGate } from '@/components/features/onboarding/OnboardingGate';

import { BottomNavigation } from '../BottomNavigation';
import { Header } from '../Header';
import { PageTransition } from '../PageTransition';
import { Sidebar } from '../Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Application shell layout for authenticated pages.
 * Includes Header, Sidebar (desktop), BottomNavigation (mobile), page transitions,
 * and the onboarding overlay for first-time users.
 */
export function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header user={session?.user} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 pb-20 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <BottomNavigation />
      <OnboardingGate />
    </div>
  );
}

AppShell.displayName = 'AppShell';
